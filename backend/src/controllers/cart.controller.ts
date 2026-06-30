import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let cart = await prisma.cart.findUnique({
      where: { buyerId: userId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true, imageUrl: true, stock: true },
            },
          },
        },
        store: {
          select: { name: true },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId: userId },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, price: true, imageUrl: true, stock: true },
              },
            },
          },
          store: {
            select: { name: true },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

    res.json({ ...cart, subtotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({ error: 'Invalid product or quantity' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found or inactive' });
      return;
    }

    const cart = await prisma.cart.upsert({
      where: { buyerId: userId },
      create: { buyerId: userId },
      update: {},
      include: { items: true },
    });

    if (cart.storeId && cart.storeId !== product.storeId && cart.items.length > 0) {
      res.status(409).json({
        error: 'Keranjang sudah berisi produk dari toko lain. Silakan kosongkan keranjang terlebih dahulu.',
        currentStoreId: cart.storeId,
      });
      return;
    }

    const existingItem = cart.items.find((item) => item.productId === productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < newQuantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity: newQuantity },
      });

      if (cart.storeId !== product.storeId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { storeId: product.storeId },
        });
      }
    });

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({ error: 'Invalid quantity' });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.buyerId !== userId) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    if (item.product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { include: { items: true } } },
    });

    if (!item || item.cart.buyerId !== userId) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.delete({ where: { id: itemId } });
      
      if (item.cart.items.length === 1) { // This was the last item
        await tx.cart.update({
          where: { id: item.cart.id },
          data: { storeId: null },
        });
      }
    });

    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { buyerId: userId },
    });

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      
      await tx.cart.update({
        where: { id: cart.id },
        data: { storeId: null },
      });
    });

    res.json({ message: 'Keranjang dikosongkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
