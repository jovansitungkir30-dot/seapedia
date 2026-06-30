import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const addresses = await prisma.deliveryAddress.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { label, recipientName, phone, addressLine, city, province, postalCode, isDefault } = req.body;

    if (!label || !recipientName || !phone || !addressLine || !city || !province || !postalCode) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.deliveryAddress.updateMany({
          where: { buyerId: userId },
          data: { isDefault: false },
        });
      }

      const newAddress = await tx.deliveryAddress.create({
        data: {
          buyerId: userId,
          label,
          recipientName,
          phone,
          addressLine,
          city,
          province,
          postalCode,
          isDefault: isDefault || false,
        },
      });

      return newAddress;
    });

    res.status(201).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { label, recipientName, phone, addressLine, city, province, postalCode } = req.body;

    const existingAddress = await prisma.deliveryAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.buyerId !== userId) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    const updatedAddress = await prisma.deliveryAddress.update({
      where: { id },
      data: {
        label,
        recipientName,
        phone,
        addressLine,
        city,
        province,
        postalCode,
      },
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const existingAddress = await prisma.deliveryAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.buyerId !== userId) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.deliveryAddress.delete({
      where: { id },
    });

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const existingAddress = await prisma.deliveryAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.buyerId !== userId) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
      await tx.deliveryAddress.updateMany({
        where: { buyerId: userId },
        data: { isDefault: false },
      });

      return tx.deliveryAddress.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
