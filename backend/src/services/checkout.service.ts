import { prisma } from '../utils/prisma';

export const DELIVERY_FEES: Record<string, number> = {
  INSTANT: 25000,
  NEXT_DAY: 15000,
  REGULAR: 9000,
};

export const processCheckout = async (
  buyerId: string,
  deliveryAddressId: string,
  deliveryMethod: string
) => {
  return await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang kosong');
    }

    const deliveryAddress = await tx.deliveryAddress.findUnique({
      where: { id: deliveryAddressId },
    });

    if (!deliveryAddress || deliveryAddress.buyerId !== buyerId) {
      throw new Error('Alamat pengiriman tidak valid');
    }

    if (!cart.storeId) {
      throw new Error('Keranjang tidak memiliki informasi toko');
    }

    let subtotal = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Stok tidak mencukupi untuk produk ${item.product.name}`);
      }
      subtotal += item.product.price * item.quantity;
    }

    const deliveryFee = DELIVERY_FEES[deliveryMethod] || DELIVERY_FEES.REGULAR;
    const discountAmount = 0; // Discount calculation comes in Level 4
    const taxBase = subtotal - discountAmount + deliveryFee;
    const taxAmount = taxBase * 0.12;
    const totalAmount = taxBase + taxAmount;

    let wallet = await tx.wallet.findUnique({
      where: { buyerId },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { buyerId, balance: 0 },
      });
    }

    if (wallet.balance < totalAmount) {
      throw new Error('Saldo tidak mencukupi');
    }

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const orderStoreId = cart.storeId;
    const store = await tx.store.findUnique({ where: { id: orderStoreId } });
    if (!store) {
      throw new Error('Toko tidak ditemukan');
    }

    const order = await tx.order.create({
      data: {
        buyerId,
        sellerId: store.sellerId,
        storeId: orderStoreId,
        deliveryMethod,
        deliveryAddressId,
        subtotal,
        discountAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        status: 'SEDANG_DIKEMAS',
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: 'SEDANG_DIKEMAS',
            note: 'Pesanan dibuat',
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    await tx.wallet.update({
      where: { buyerId },
      data: { balance: { decrement: totalAmount } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'PAYMENT',
        amount: totalAmount,
        description: `Pembayaran pesanan #${order.id.slice(-8)}`,
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { storeId: null },
    });

    return order;
  });
};
