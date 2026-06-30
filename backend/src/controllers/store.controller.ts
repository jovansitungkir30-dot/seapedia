import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.length > 100) {
      return res.status(400).json({ error: 'Nama toko tidak valid (maksimal 100 karakter)' });
    }

    const existingName = await prisma.store.findUnique({ where: { name } });
    if (existingName) {
      return res.status(409).json({ error: 'Nama toko sudah digunakan' });
    }

    const existingStore = await prisma.store.findUnique({ where: { sellerId: req.user?.userId } });
    if (existingStore) {
      return res.status(400).json({ error: 'Anda sudah memiliki toko' });
    }

    const store = await prisma.store.create({
      data: {
        name,
        description,
        sellerId: req.user!.userId,
      },
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const getOwnStore = async (req: Request, res: Response) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user?.userId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Toko belum dibuat' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const store = await prisma.store.findUnique({ where: { sellerId: req.user?.userId } });
    if (!store) {
      return res.status(404).json({ error: 'Toko belum dibuat' });
    }

    if (name && name !== store.name) {
      const existingName = await prisma.store.findUnique({ where: { name } });
      if (existingName) {
        return res.status(409).json({ error: 'Nama toko sudah digunakan' });
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { name, description },
    });

    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const store = await prisma.store.findUnique({
      where: { id },
      include: { seller: { select: { username: true } } },
    });

    if (!store) {
      return res.status(404).json({ error: 'Toko tidak ditemukan' });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { storeId: id, isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({
        where: { storeId: id, isActive: true },
      }),
    ]);

    res.json({ store, products, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};
