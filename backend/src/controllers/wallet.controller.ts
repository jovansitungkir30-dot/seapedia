import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let wallet = await prisma.wallet.findUnique({
      where: { buyerId: userId },
      include: {
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          buyerId: userId,
          balance: 0,
        },
        include: {
          transactions: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const topUpWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000000 || !Number.isInteger(amount)) {
      res.status(400).json({ error: 'Invalid top-up amount' });
      return;
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { buyerId: userId },
        update: {
          balance: { increment: amount },
        },
        create: {
          buyerId: userId,
          balance: amount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOPUP',
          amount,
          description: `Top up Rp ${amount.toLocaleString('id-ID')}`,
        },
      });

      return wallet;
    });

    res.json(updatedWallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
