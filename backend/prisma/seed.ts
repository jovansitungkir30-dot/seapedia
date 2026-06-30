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

  console.log('✅ Seed complete: admin@seapedia.com & seller1@seapedia.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
