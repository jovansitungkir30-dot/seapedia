import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { username: true, email: true } },
        seller: { select: { username: true, email: true } },
        store: { select: { name: true } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveries = await prisma.deliveryJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { username: true, email: true } },
        order: {
          select: {
            id: true,
            status: true,
            store: { select: { name: true } },
            deliveryAddress: true,
          }
        },
      },
    });
    res.json(deliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
