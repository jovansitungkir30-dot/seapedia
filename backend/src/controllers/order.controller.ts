import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { processCheckout } from '../services/checkout.service';

export const checkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { deliveryAddressId, deliveryMethod } = req.body;

    if (!deliveryAddressId || !deliveryMethod) {
      res.status(400).json({ error: 'Alamat pengiriman dan metode pengiriman wajib diisi' });
      return;
    }

    const order = await processCheckout(userId, deliveryAddressId, deliveryMethod);
    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    if (error.message) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBuyerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { name: true } },
        items: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBuyerOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        deliveryAddress: true,
      },
    });

    if (!order || order.buyerId !== userId) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { sellerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { username: true } },
        items: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellerOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { username: true } },
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        deliveryAddress: true,
      },
    });

    if (!order || order.sellerId !== userId) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
