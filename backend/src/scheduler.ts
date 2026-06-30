import cron from 'node-cron';
import { prisma } from './utils/prisma';

export const initScheduler = () => {
  // Check every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Scheduler] Running overdue order check...');
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const overdueOrders = await prisma.order.findMany({
        where: {
          status: 'SEDANG_DIKEMAS',
          createdAt: {
            lt: oneDayAgo,
          },
        },
        include: {
          items: true,
        }
      });

      if (overdueOrders.length === 0) {
        console.log('[Scheduler] No overdue orders found.');
        return;
      }

      console.log(`[Scheduler] Found ${overdueOrders.length} overdue orders. Processing cancellation...`);

      for (const order of overdueOrders) {
        await prisma.$transaction(async (tx) => {
          // 1. Change status to DIKEMBALIKAN
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'DIKEMBALIKAN' },
          });

          // 2. Add history
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'DIKEMBALIKAN',
              note: 'Otomatis dibatalkan karena penjual terlambat memproses',
            },
          });

          // 3. Refund to buyer wallet
          let wallet = await tx.wallet.findUnique({ where: { buyerId: order.buyerId } });
          if (!wallet) {
            wallet = await tx.wallet.create({ data: { buyerId: order.buyerId, balance: 0 } });
          }
          await tx.wallet.update({
            where: { buyerId: order.buyerId },
            data: { balance: { increment: order.totalAmount } },
          });

          // 4. Restore stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
        console.log(`[Scheduler] Cancelled and refunded order ${order.id}`);
      }
    } catch (error) {
      console.error('[Scheduler] Error processing overdue orders:', error);
    }
  });
  console.log('[Scheduler] Initialized node-cron jobs.');
};
