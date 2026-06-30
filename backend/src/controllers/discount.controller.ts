import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxUsage, expiresAt } = req.body;

    if (!code || !description || !discountType || !discountValue || maxUsage === undefined || !expiresAt) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) {
      res.status(409).json({ error: 'Voucher code already exists' });
      return;
    }

    const voucher = await prisma.voucher.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxUsage,
        expiresAt: new Date(expiresAt),
      },
    });

    res.status(201).json(voucher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
    const now = new Date();

    const withStatus = vouchers.map((v) => {
      let status = 'ACTIVE';
      if (v.expiresAt < now) status = 'EXPIRED';
      else if (v.usedCount >= v.maxUsage) status = 'EXHAUSTED';
      
      return { ...v, status };
    });

    res.json(withStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    
    if (!voucher) {
      res.status(404).json({ error: 'Voucher not found' });
      return;
    }

    res.json(voucher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPromo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, expiresAt } = req.body;

    if (!code || !description || !discountType || !discountValue || !expiresAt) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existing = await prisma.promo.findUnique({ where: { code } });
    if (existing) {
      res.status(409).json({ error: 'Promo code already exists' });
      return;
    }

    const promo = await prisma.promo.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        expiresAt: new Date(expiresAt),
      },
    });

    res.status(201).json(promo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromos = async (req: Request, res: Response): Promise<void> => {
  try {
    const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const promo = await prisma.promo.findUnique({ where: { id } });
    
    if (!promo) {
      res.status(404).json({ error: 'Promo not found' });
      return;
    }

    res.json(promo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.query;
    
    if (!code || !subtotal) {
      res.status(400).json({ valid: false, reason: 'Missing code or subtotal' });
      return;
    }

    const voucher = await prisma.voucher.findUnique({ where: { code: String(code) } });
    if (!voucher) {
      res.status(404).json({ valid: false, reason: 'Voucher tidak ditemukan' });
      return;
    }

    if (voucher.expiresAt < new Date()) {
      res.status(400).json({ valid: false, reason: 'Voucher sudah kadaluarsa' });
      return;
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      res.status(400).json({ valid: false, reason: 'Voucher sudah habis digunakan' });
      return;
    }

    const orderSubtotal = Number(subtotal);
    if (orderSubtotal < voucher.minOrderAmount) {
      res.status(400).json({ valid: false, reason: `Minimal belanja Rp ${voucher.minOrderAmount.toLocaleString('id-ID')} untuk menggunakan voucher ini` });
      return;
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = orderSubtotal * (voucher.discountValue / 100);
    } else {
      discountAmount = voucher.discountValue;
    }

    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    res.json({ valid: true, voucher, discountAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, reason: 'Internal server error' });
  }
};

export const validatePromo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.query;
    
    if (!code || !subtotal) {
      res.status(400).json({ valid: false, reason: 'Missing code or subtotal' });
      return;
    }

    const promo = await prisma.promo.findUnique({ where: { code: String(code) } });
    if (!promo) {
      res.status(404).json({ valid: false, reason: 'Promo tidak ditemukan' });
      return;
    }

    if (promo.expiresAt < new Date()) {
      res.status(400).json({ valid: false, reason: 'Promo sudah kadaluarsa' });
      return;
    }

    const orderSubtotal = Number(subtotal);
    if (orderSubtotal < promo.minOrderAmount) {
      res.status(400).json({ valid: false, reason: `Minimal belanja Rp ${promo.minOrderAmount.toLocaleString('id-ID')} untuk menggunakan promo ini` });
      return;
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = orderSubtotal * (promo.discountValue / 100);
    } else {
      discountAmount = promo.discountValue;
    }

    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    res.json({ valid: true, promo, discountAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, reason: 'Internal server error' });
  }
};
