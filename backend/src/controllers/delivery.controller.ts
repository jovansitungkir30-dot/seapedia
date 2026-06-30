import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAvailableJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.deliveryJob.findMany({
      where: { status: 'MENCARI_DRIVER' },
      include: {
        order: {
          include: {
            store: true,
            deliveryAddress: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const jobs = await prisma.deliveryJob.findMany({
      where: { driverId },
      include: {
        order: {
          include: {
            store: true,
            deliveryAddress: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.userId;
    const { id } = req.params;

    if (!driverId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await prisma.deliveryJob.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: 'Delivery job not found' });
      return;
    }

    if (job.status !== 'MENCARI_DRIVER' || job.driverId) {
      res.status(400).json({ error: 'Pekerjaan ini sudah diambil orang lain' });
      return;
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryJob.update({
        where: { id },
        data: {
          driverId,
          status: 'DRIVER_MENUJU_TOKO',
        },
      });

      // We don't necessarily need to update order status here since order status MENCARI_DRIVER implies driver is finding/heading to store, but we can if we want.
      // Let's add history.
      await tx.orderStatusHistory.create({
        data: {
          orderId: job.orderId,
          status: 'MENCARI_DRIVER',
          note: 'Driver telah menerima pesanan dan menuju toko',
        },
      });

      return updated;
    });

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const pickupJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.userId;
    const { id } = req.params;

    const job = await prisma.deliveryJob.findUnique({ where: { id } });
    if (!job || job.driverId !== driverId) {
      res.status(404).json({ error: 'Pekerjaan tidak ditemukan' });
      return;
    }

    if (job.status !== 'DRIVER_MENUJU_TOKO') {
      res.status(400).json({ error: 'Status tidak valid untuk pickup' });
      return;
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryJob.update({
        where: { id },
        data: {
          status: 'SEDANG_DIKIRIM',
          pickupTime: new Date(),
        },
      });

      await tx.order.update({
        where: { id: job.orderId },
        data: { status: 'SEDANG_DIKIRIM' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: job.orderId,
          status: 'SEDANG_DIKIRIM',
          note: 'Pesanan telah diambil oleh driver dan sedang dalam perjalanan',
        },
      });

      return updated;
    });

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.userId;
    const { id } = req.params;

    const job = await prisma.deliveryJob.findUnique({ where: { id }, include: { order: true } });
    if (!job || job.driverId !== driverId) {
      res.status(404).json({ error: 'Pekerjaan tidak ditemukan' });
      return;
    }

    if (job.status !== 'SEDANG_DIKIRIM') {
      res.status(400).json({ error: 'Status tidak valid untuk diselesaikan' });
      return;
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryJob.update({
        where: { id },
        data: {
          status: 'SELESAI',
          deliveryTime: new Date(),
        },
      });

      await tx.order.update({
        where: { id: job.orderId },
        data: { status: 'PESANAN_SELESAI' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: job.orderId,
          status: 'PESANAN_SELESAI',
          note: 'Pesanan telah selesai diantar. Dana diteruskan ke penjual.',
        },
      });

      // Transfer funds to seller
      const sellerId = job.order.sellerId;
      const orderAmount = job.order.totalAmount;

      let sellerWallet = await tx.wallet.findUnique({ where: { buyerId: sellerId } }); // Wait, seller wallet is same as buyer wallet because wallet uses userId (buyerId is just the foreign key, which is confusingly named but it maps to User). Let me check Wallet schema.
      if (!sellerWallet) {
        sellerWallet = await tx.wallet.create({ data: { buyerId: sellerId, balance: 0 } });
      }

      await tx.wallet.update({
        where: { buyerId: sellerId },
        data: { balance: { increment: orderAmount } }
      });

      return updated;
    });

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
