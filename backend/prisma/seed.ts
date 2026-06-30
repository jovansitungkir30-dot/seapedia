import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@seapedia.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@seapedia.com',
      password: adminPassword,
      roles: { create: [{ role: 'ADMIN' }] },
    },
  });

  const sellerPassword = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller1@seapedia.com' },
    update: {},
    create: {
      username: 'seller1',
      email: 'seller1@seapedia.com',
      password: sellerPassword,
      roles: { create: [{ role: 'SELLER' }] },
      stores: {
        create: {
          name: 'Toko Elektronik Jaya',
          description: 'Pusat elektronik terbaik di SEAPEDIA',
          products: {
            create: [
              { name: 'Laptop Pro X', description: 'Laptop kencang untuk kerja', price: 15000000, stock: 10 },
              { name: 'Smartphone Z', description: 'Kamera 100MP', price: 8000000, stock: 25 },
              { name: 'Wireless Earbuds', description: 'Suara jernih dengan noise cancelling', price: 1200000, stock: 50 },
              { name: 'Smartwatch V', description: 'Pantau kesehatan setiap hari', price: 2500000, stock: 15 },
              { name: 'Powerbank 20000mAh', description: 'Baterai cadangan awet', price: 350000, stock: 100 },
            ],
          },
        },
      },
    },
  });

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await prisma.voucher.upsert({
    where: { code: 'SAVE10' },
    update: {},
    create: {
      code: 'SAVE10',
      description: 'Diskon 10% (Min Belanja Rp 50.000)',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 50000,
      maxUsage: 100,
      expiresAt: nextYear,
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'POTONG20K' },
    update: {},
    create: {
      code: 'POTONG20K',
      description: 'Potongan Harga Rp 20.000 (Min Belanja Rp 100.000)',
      discountType: 'FIXED',
      discountValue: 20000,
      minOrderAmount: 100000,
      maxUsage: 50,
      expiresAt: nextYear,
    },
  });

  await prisma.promo.upsert({
    where: { code: 'PROMO5' },
    update: {},
    create: {
      code: 'PROMO5',
      description: 'Promo Spesial Diskon 5% Tanpa Minimal Belanja',
      discountType: 'PERCENTAGE',
      discountValue: 5,
      minOrderAmount: 0,
      expiresAt: nextYear,
    },
  });

  const driverPassword = await bcrypt.hash('Driver123!', 12);
  await prisma.user.upsert({
    where: { email: 'driver1@test.com' },
    update: {},
    create: {
      username: 'driver1',
      email: 'driver1@test.com',
      password: driverPassword,
      roles: { create: [{ role: 'DRIVER' }] },
    },
  });

  console.log('✅ Seed complete: admin, seller, driver, vouchers, and promos');
}

main().catch(console.error).finally(() => prisma.$disconnect());
