import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;
    if (price <= 0 || stock < 0) {
      return res.status(400).json({ error: 'Harga harus lebih dari 0 dan stok tidak boleh negatif' });
    }

    const store = await prisma.store.findUnique({ where: { sellerId: req.user?.userId } });
    if (!store) {
      return res.status(400).json({ error: 'Buat toko terlebih dahulu' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        storeId: store.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const store = await prisma.store.findUnique({ where: { sellerId: req.user?.userId } });
    if (!store) {
      return res.json([]);
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, isActive } = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    if (product.store.sellerId !== req.user?.userId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengubah produk ini' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock, imageUrl, isActive },
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    if (product.store.sellerId !== req.user?.userId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses' });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Produk dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const whereClause = {
      isActive: true,
      name: { contains: search },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { store: { select: { name: true, id: true } } },
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    res.json({ products, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

export const getPublicProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: { store: { select: { name: true, id: true } } },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};
