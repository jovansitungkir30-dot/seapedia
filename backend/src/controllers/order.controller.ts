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

    const { deliveryAddressId, deliveryMethod, voucherCode, promoCode } = req.body;

    if (!deliveryAddressId || !deliveryMethod) {
      res.status(400).json({ error: 'Alamat pengiriman dan metode pengiriman wajib diisi' });
      return;
    }

    const order = await processCheckout(userId, deliveryAddressId, deliveryMethod, voucherCode, promoCode);
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

export const processSellerOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { sellerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Toko tidak ditemukan' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      return;
    }

    if (order.storeId !== store.id) {
      res.status(403).json({ error: 'Anda tidak memiliki akses ke pesanan ini' });
      return;
    }

    if (order.status !== 'SEDANG_DIKEMAS') {
      res.status(400).json({ error: 'Pesanan tidak dapat diproses pada status saat ini' });
      return;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'MENUNGGU_PENGIRIM' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'MENUNGGU_PENGIRIM',
          note: 'Diproses oleh penjual',
        },
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBuyerReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyerId = req.user?.userId;
    if (!buyerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyerId, status: 'PESANAN_SELESAI' },
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
        items: true,
      },
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    // Group by month for chart (format: "YYYY-MM")
    const spendingByMonth: Record<string, number> = {};
    for (const order of orders) {
      const month = order.createdAt.toISOString().slice(0, 7);
      spendingByMonth[month] = (spendingByMonth[month] || 0) + order.totalAmount;
    }

    const chartData = Object.keys(spendingByMonth).sort().map(month => ({
      name: month,
      total: spendingByMonth[month],
    }));

    res.json({
      totalSpent,
      orderCount,
      chartData,
      recentOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellerReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { sellerId, status: 'PESANAN_SELESAI' },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { username: true, email: true } },
        items: true,
      },
    });

    const totalIncome = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrdersCount = orders.length;

    const incomeByMonth: Record<string, number> = {};
    for (const order of orders) {
      const month = order.createdAt.toISOString().slice(0, 7);
      incomeByMonth[month] = (incomeByMonth[month] || 0) + order.totalAmount;
    }

    const chartData = Object.keys(incomeByMonth).sort().map(month => ({
      name: month,
      total: incomeByMonth[month],
    }));

    res.json({
      totalIncome,
      completedOrdersCount,
      chartData,
      recentCompletedOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPickup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { sellerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Toko tidak ditemukan' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      return;
    }

    if (order.storeId !== store.id) {
      res.status(403).json({ error: 'Anda tidak memiliki akses ke pesanan ini' });
      return;
    }

    if (order.status !== 'MENUNGGU_PENGIRIM') {
      res.status(400).json({ error: 'Pesanan belum diproses' });
      return;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Create DeliveryJob
      await tx.deliveryJob.create({
        data: {
          orderId: id,
          status: 'MENCARI_DRIVER',
        },
      });

      // Update Order status
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'MENCARI_DRIVER' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'MENCARI_DRIVER',
          note: 'Penjual request pickup, mencari driver',
        },
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Pickup sudah di-request untuk pesanan ini' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
