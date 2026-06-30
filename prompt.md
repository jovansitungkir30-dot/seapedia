<USER_REQUEST>
# SEAPEDIA — Full Build Prompt for AI IDE
## Copy this entire file and paste into Antigravity IDE

---

You are building **SEAPEDIA**, a fullstack multi-role e-commerce platform from scratch.
Follow every step in exact order. Do not skip steps. Do not proceed to the next level until the current level is verified and committed.

---

## TECH STACK (non-negotiable)

- **Backend:** Node.js + Express + TypeScript + Prisma ORM + **SQLite** (file-based, zero config)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **API Docs:** swagger-ui-express + swagger-jsdoc
- **Scheduler:** node-cron
- **Security:** helmet + express-rate-limit + sanitize-html

---

## PROJECT STRUCTURE

```
seapedia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── .env.local
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## BEFORE YOU START

Create a GitHub repository named `seapedia` and set it to public. Then in your terminal:

```bash
mkdir seapedia && cd seapedia
git init
git branch -M main
git remote add origin https://github.com/jovansitungkir30-dot/seapedia.git
```

---

## ═══════════════════════════════════════
## PHASE 0 — PROJECT INITIALIZATION
## ═══════════════════════════════════════

### BACKEND SETUP

Create `backend/package.json`:
```json
{
  "name": "seapedia-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "express-rate-limit": "^7.0.0",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "node-cron": "^3.0.0",
    "sanitize-html": "^2.11.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.0",
    "@types/cors": "^2.8.0",
    "@types/express": "^4.17.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^20.0.0",
    "@types/node-cron": "^3.0.0",
    "@types/sanitize-html": "^2.9.0",
    "@types/swagger-jsdoc": "^6.0.0",
    "@types/swagger-ui-express": "^4.1.0",
    "prisma": "^5.0.0",
    "ts-node": "^10.9.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create `backend/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="seapedia_super_secret_key_change_in_production"
PORT=4000
NODE_ENV=development
```

Create `backend/.env.example`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_here"
PORT=4000
NODE_ENV=development
```

Create `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Run in backend/:
```bash
cd backend && npm install && npx prisma init --datasource-provider sqlite
```

### FRONTEND SETUP

Run:
```bash
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
npm install axios react-hook-form @hookform/resolvers zod
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card badge toast dialog sheet separator
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Create `frontend/.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### INITIAL COMMIT

```bash
cd ..
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo "*.db" >> .gitignore
echo ".next/" >> .gitignore
git add .
git commit -m "chore: initialize monorepo with backend (Express+Prisma+SQLite) and frontend (Next.js)"
git push origin main
```

---

## ═══════════════════════════════════════
## LEVEL 1 — PUBLIC MARKETPLACE, AUTH & REVIEWS (20 pts)
## ═══════════════════════════════════════

### STEP 1.1 — PRISMA SCHEMA (Full schema for Level 1)

Replace contents of `backend/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum RoleType {
  ADMIN
  SELLER
  BUYER
  DRIVER
}

model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String    @unique
  password    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  roles       UserRole[]
  reviews     ApplicationReview[]
}

model UserRole {
  id        String    @id @default(cuid())
  userId    String
  role      RoleType
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role])
}

model ApplicationReview {
  id           String   @id @default(cuid())
  reviewerName String
  rating       Int
  comment      String
  userId       String?
  createdAt    DateTime @default(now())

  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

Run in backend/:
```bash
npx prisma migrate dev --name level1_init
```

### STEP 1.2 — SEED FILE

Create `backend/prisma/seed.ts`:
```typescript
import { PrismaClient, RoleType } from '@prisma/client';
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
      roles: { create: [{ role: RoleType.ADMIN }] },
    },
  });

  console.log('✅ Seed complete: admin@seapedia.com / Admin123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Add to `backend/package.json` scripts:
```json
"seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
```

Run:
```bash
npm run seed
```

### STEP 1.3 — BACKEND CORE FILES

Create `backend/src/utils/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

Create `backend/src/middlewares/auth.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const tokenBlacklist = new Set<string>();

export interface JwtPayload {
  userId: string;
  activeRole?: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const blacklistToken = (token: string) => tokenBlacklist.add(token);

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been invalidated' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.activeRole !== role) {
    return res.status(403).json({ error: `This action requires ${role} role. Your active role is ${req.user.activeRole || 'none'}.` });
  }
  next();
};

export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};
```

Create `backend/src/controllers/auth.controller.ts`:
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { blacklistToken, extractToken, JwtPayload } from '../middlewares/auth.middleware';
import { RoleType } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.enum(['SELLER', 'BUYER', 'DRIVER'])).min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { username, email, password, roles } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username, email, password: hashed,
      roles: { create: roles.map(r => ({ role: r as RoleType })) },
    },
    include: { roles: true },
  });
  res.status(201).json({ message: 'Registered successfully', user: { id: user.id, username: user.username, email: user.email, roles: user.roles.map(r => r.role) } });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const roles = user.roles.map(r => r.role);
  const payload: JwtPayload = { userId: user.id, roles };

  if (roles.length === 1) {
    payload.activeRole = roles[0];
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, roles },
    requiresRoleSelection: roles.length > 1 && !roles.includes('ADMIN'),
  });
};

export const selectRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });
  if (!req.user!.roles.includes(role)) return res.status(403).json({ error: 'You do not have this role' });

  const newToken = jwt.sign({ ...req.user, activeRole: role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token: newToken, activeRole: role });
};

export const logout = async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) blacklistToken(token);
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { roles: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id, username: user.username, email: user.email,
    roles: user.roles.map(r => r.role),
    activeRole: req.user!.activeRole,
  });
};
```

Create `backend/src/controllers/review.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../utils/prisma';

const reviewSchema = z.object({
  reviewerName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
});

const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

export const createReview = async (req: Request, res: Response) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { reviewerName, rating, comment } = parsed.data;

  const review = await prisma.applicationReview.create({
    data: {
      reviewerName: sanitize(reviewerName),
      rating,
      comment: sanitize(comment),
      userId: req.user?.userId ?? null,
    },
  });
  res.status(201).json(review);
};

export const getReviews = async (_req: Request, res: Response) => {
  const reviews = await prisma.applicationReview.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(reviews);
};
```

Create `backend/src/routes/index.ts`:
```typescript
import { Router } from 'express';
import { register, login, selectRole, logout, me } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/select-role', verifyToken, selectRole);
router.post('/auth/logout', verifyToken, logout);
router.get('/auth/me', verifyToken, me);

// Reviews
router.post('/reviews', (req, res, next) => { verifyToken(req, res, (err) => { if (err) return next(); next(); }); }, createReview);
router.get('/reviews', getReviews);

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default router;
```

Create `backend/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL || ''], credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', router);

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
```

### STEP 1.4 — FRONTEND LEVEL 1

Create `frontend/lib/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('seapedia_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('seapedia_token');
      localStorage.removeItem('seapedia_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

Create `frontend/lib/auth.ts`:
```typescript
export interface AuthUser {
  id: string; username: string; email: string;
  roles: string[]; activeRole?: string;
}

export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('seapedia_token') : null;
export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('seapedia_user');
  return raw ? JSON.parse(raw) : null;
};
export const setAuth = (token: string, user: AuthUser) => {
  localStorage.setItem('seapedia_token', token);
  localStorage.setItem('seapedia_user', JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem('seapedia_token');
  localStorage.removeItem('seapedia_user');
};
export const isLoggedIn = () => !!getToken();
export const getActiveRole = () => getUser()?.activeRole;
```

Now create the following frontend pages and components. Each should be a complete, working implementation:

**`frontend/components/layout/Navbar.tsx`**
- SEAPEDIA logo/brand on left
- Nav links: Home, Products, Reviews
- Right side: if guest → Login + Register buttons; if logged in → show username badge with activeRole colored chip (BUYER=blue, SELLER=green, DRIVER=orange, ADMIN=red), Dashboard button, Logout button
- Responsive with hamburger menu on mobile using shadcn Sheet component
- On logout: call POST /api/auth/logout, clearAuth(), redirect to /

**`frontend/components/layout/Footer.tsx`**
- Simple footer: "© 2025 SEAPEDIA — Marketplace untuk semua"

**`frontend/app/layout.tsx`**
- Include Navbar and Footer
- Include Toaster from shadcn

**`frontend/app/page.tsx`** (Landing page)
- Hero section: large heading "SEAPEDIA", subheading "Marketplace yang menghubungkan Pembeli, Penjual, dan Pengemudi", CTA button "Jelajahi Produk"
- Features section: 3 cards describing Buyer, Seller, Driver experience
- Reviews section: fetch from GET /api/reviews, show ReviewCard grid (name, stars, comment, date), ReviewForm below (name, rating 1-5 star select, comment textarea, submit button)
- Footer

**`frontend/app/products/page.tsx`**
- Heading "Katalog Produk"
- Search input that filters by product name (client-side filter for now, dummy data is fine at this level)
- Grid of ProductCard components: image placeholder (gray box with product name initials), product name, price formatted as "Rp X.XXX", store name, "Lihat Detail" button linking to /products/:id
- Use 6 hardcoded dummy products for now (will be replaced in Level 2)

**`frontend/app/products/[id]/page.tsx`**
- Show product details (name, description, price, stock, store info)
- "Add to Cart" button only if user activeRole === 'BUYER' (else show "Login sebagai Pembeli untuk membeli")
- Use dummy data matching the dummy list for now

**`frontend/app/auth/login/page.tsx`**
- Email + password form with react-hook-form + zod validation
- POST to /api/auth/login
- On success: save token + user to localStorage
- If requiresRoleSelection → redirect to /auth/select-role
- Else → redirect to /${activeRole.toLowerCase()}/dashboard
- Show error message on failure

**`frontend/app/auth/register/page.tsx`**
- Username, email, password, confirm password
- Role checkboxes: Buyer, Seller, Driver (min 1 required, ADMIN hidden)
- POST to /api/auth/register → then auto-login → redirect

**`frontend/app/auth/select-role/page.tsx`**
- Show greeting with username
- Show a card for each owned role with icon and description
- On click: POST /api/auth/select-role with chosen role
- Save new token, update user in localStorage, redirect to /${role.toLowerCase()}/dashboard

**Dashboard shells** (protected — redirect to /auth/login if no token or wrong role):
- `frontend/app/buyer/dashboard/page.tsx` — "Selamat Datang, Pembeli!" with sidebar links: Beranda, Dompet, Alamat, Keranjang, Pesanan, Laporan
- `frontend/app/seller/dashboard/page.tsx` — "Selamat Datang, Penjual!" with sidebar links: Beranda, Toko Saya, Produk, Pesanan, Laporan
- `frontend/app/driver/dashboard/page.tsx` — "Selamat Datang, Pengemudi!" with sidebar links: Beranda, Cari Pekerjaan, Pekerjaan Saya, Penghasilan
- `frontend/app/admin/dashboard/page.tsx` — "Admin Panel" with sidebar links: Beranda, Pengguna, Toko, Produk, Pesanan, Diskon, Pengiriman, Pesanan Terlambat

Create `frontend/components/layout/DashboardLayout.tsx` — reusable sidebar layout component used by all dashboards.

Create `frontend/components/auth/ProtectedRoute.tsx` — HOC that checks localStorage for token and activeRole, redirects if missing.

---

### ⏸️ WAIT — VERIFY LEVEL 1 BEFORE COMMITTING

Start both servers:
```bash
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

Manually verify:
- [ ] http://localhost:3000 loads landing page with hero, features, and reviews section
- [ ] http://localhost:3000/products loads product listing with dummy data
- [ ] http://localhost:3000/products/1 loads product detail
- [ ] http://localhost:3000/auth/register — register a new user (e.g., buyer1@test.com, roles: [BUYER])
- [ ] After register → login → redirected to /buyer/dashboard
- [ ] Register another user with multiple roles (BUYER + SELLER) → after login → /auth/select-role page appears
- [ ] Submit a review from landing page → review appears in list without XSS execution
- [ ] Try submitting `<script>alert(1)</script>` as a review comment → it should show as plain text, not execute
- [ ] Logout button works, redirects to home, nav changes back to guest state
- [ ] http://localhost:3000/buyer/dashboard without login → redirects to /auth/login
- [ ] GET http://localhost:4000/api/health → `{ "status": "ok" }`
- [ ] GET http://localhost:4000/api/reviews → returns reviews array

If all checks pass, proceed to commit.

### GIT — LEVEL 1

```bash
cd /path/to/seapedia
git add .
git commit -m "feat: level 1 - public marketplace, auth with multi-role, application reviews, dashboard shells"
git push origin main
```

---

## ═══════════════════════════════════════
## LEVEL 2 — SELLER EXPERIENCE (15 pts)
## ═══════════════════════════════════════

### STEP 2.1 — UPDATE PRISMA SCHEMA

Add these models to `backend/prisma/schema.prisma` (keep existing models, add below):

```prisma
model Store {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  sellerId    String    @unique
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  seller      User      @relation("SellerStore", fields: [sellerId], references: [id])
  products    Product[]
}

model Product {
  id          String    @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int       @default(0)
  imageUrl    String?
  isActive    Boolean   @default(true)
  storeId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  store       Store     @relation(fields: [storeId], references: [id])
}
```

Add `stores Store? @relation("SellerStore")` to the User model.

Run:
```bash
cd backend && npx prisma migrate dev --name level2_store_product
```

### STEP 2.2 — SELLER BACKEND ENDPOINTS

Create `backend/src/controllers/store.controller.ts`:

Implement these endpoints:
- `POST /api/seller/store` — requireRole SELLER. Body: { name, description }. Validate name not empty, max 100 chars. Check @unique constraint — if name taken return 409 "Nama toko sudah digunakan". Check seller has no existing store — if has one return 400 "Anda sudah memiliki toko". Create store with sellerId = req.user.userId. Return created store.
- `GET /api/seller/store` — requireRole SELLER. Return own store + product count. If no store return 404.
- `PUT /api/seller/store` — requireRole SELLER. Update name/description. Re-validate uniqueness (exclude own store from check). Return updated store.
- `GET /api/stores/:id` — public. Return store info + paginated products (active only). Query: ?page=1&limit=12

Create `backend/src/controllers/product.controller.ts`:

Implement these endpoints:
- `POST /api/seller/products` — requireRole SELLER. Body: { name, description, price, stock, imageUrl? }. Validate price > 0, stock >= 0. Seller must have a store (else 400 "Buat toko terlebih dahulu"). Associate with seller's storeId. Return created product.
- `GET /api/seller/products` — requireRole SELLER. Return all products in seller's store ordered by createdAt desc.
- `PUT /api/seller/products/:id` — requireRole SELLER. Verify product.store.sellerId === req.user.userId (else 403). Update fields. Return updated product.
- `DELETE /api/seller/products/:id` — requireRole SELLER. Verify ownership. Soft delete: set isActive = false. Return { message: "Produk dihapus" }.
- `GET /api/products` — public. Return all active products with store info. Support ?search= query param (filter name LIKE). Paginate: ?page=1&limit=12. Response: { products, total, page, limit }
- `GET /api/products/:id` — public. Return product with store info. Return 404 if not found or isActive=false.

Add all routes to `backend/src/routes/index.ts`.

### STEP 2.3 — UPDATE SEED

Update `backend/prisma/seed.ts` to also seed:
- seller1@seapedia.com / Seller123! with role SELLER
- Store: "Toko Elektronik Jaya" owned by seller1
- 5 products in that store (phones, laptops, etc. with realistic prices)

Run: `npm run seed`

### STEP 2.4 — SELLER FRONTEND PAGES

**`frontend/app/seller/store/page.tsx`**
- If no store: show CreateStoreForm (name, description inputs)
- If store exists: show store info card with Edit button → opens EditStoreModal
- Show product count

**`frontend/app/seller/products/page.tsx`**
- Table: product name, price, stock, status (active/inactive), Edit | Delete actions
- "Tambah Produk" button → navigates to /seller/products/new
- Confirm dialog before delete

**`frontend/app/seller/products/new/page.tsx`**
- Form: name, description, price (number), stock (number), imageUrl (optional)
- POST to /api/seller/products → success toast → redirect to /seller/products

**`frontend/app/seller/products/[id]/edit/page.tsx`**
- Pre-fill form from GET /api/seller/products/:id (use seller products list)
- PUT to update

**Update `frontend/app/products/page.tsx`**
- Replace dummy data with real API call to GET /api/products
- Add search input that calls API with ?search=term
- Show store name on each card

**Update `frontend/app/products/[id]/page.tsx`**
- Replace dummy data with real GET /api/products/:id
- Show store name as clickable link to /stores/:storeId

**`frontend/app/stores/[id]/page.tsx`**
- Show store name, description, seller info
- Product grid from store's products

---

### ⏸️ WAIT — VERIFY LEVEL 2

- [ ] Login as seller1@seapedia.com → /seller/dashboard
- [ ] Navigate to Toko Saya → see existing store "Toko Elektronik Jaya"
- [ ] Try creating another store → should fail with "Anda sudah memiliki toko"
- [ ] Navigate to Produk → see 5 seeded products in table
- [ ] Add a new product → appears in list
- [ ] Edit a product → changes saved
- [ ] Delete a product → disappears from list
- [ ] http://localhost:3000/products → shows real products from DB (not dummy)
- [ ] Search for "laptop" → filters results
- [ ] Click product → detail page shows real data + store name
- [ ] Try accessing /api/seller/products without token → 401
- [ ] Try updating another seller's product → 403

### GIT — LEVEL 2

```bash
git add .
git commit -m "feat: level 2 - seller store management, product CRUD, public catalog connected to real data"
git push origin main
```

---

## ═══════════════════════════════════════
## LEVEL 3 — BUYER WALLET, CART & CHECKOUT (20 pts)
## ═══════════════════════════════════════

### STEP 3.1 — UPDATE PRISMA SCHEMA

Add these models to schema.prisma:

```prisma
enum DeliveryMethod {
  INSTANT
  NEXT_DAY
  REGULAR
}

enum OrderStatus {
  SEDANG_DIKEMAS
  MENUNGGU_PENGIRIM
  SEDANG_DIKIRIM
  PESANAN_SELESAI
  DIKEMBALIKAN
}

enum TransactionType {
  TOPUP
  PAYMENT
  REFUND
  INCOME
  INCOME_REVERSAL
}

model Wallet {
  id           String             @id @default(cuid())
  buyerId      String             @unique
  balance      Float              @default(0)
  buyer        User               @relation("BuyerWallet", fields: [buyerId], references: [id])
  transactions WalletTransaction[]
}

model WalletTransaction {
  id          String          @id @default(cuid())
  walletId    String
  type        TransactionType
  amount      Float
  description String
  orderId     String?
  createdAt   DateTime        @default(now())
  wallet      Wallet          @relation(fields: [walletId], references: [id])
}

model DeliveryAddress {
  id            String  @id @default(cuid())
  buyerId       String
  label         String
  recipientName String
  phone         String
  addressLine   String
  city          String
  province      String
  postalCode    String
  isDefault     Boolean @default(false)
  createdAt     DateTime @default(now())
  buyer         User    @relation("BuyerAddresses", fields: [buyerId], references: [id])
  orders        Order[]
}

model Cart {
  id       String     @id @default(cuid())
  buyerId  String     @unique
  storeId  String?
  buyer    User       @relation("BuyerCart", fields: [buyerId], references: [id])
  store    Store?     @relation(fields: [storeId], references: [id])
  items    CartItem[]
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
  @@unique([cartId, productId])
}

model Order {
  id                String          @id @default(cuid())
  buyerId           String
  sellerId          String
  storeId           String
  deliveryMethod    DeliveryMethod
  deliveryAddressId String
  subtotal          Float
  discountAmount    Float           @default(0)
  deliveryFee       Float
  taxAmount         Float
  totalAmount       Float
  status            OrderStatus     @default(SEDANG_DIKEMAS)
  voucherId         String?
  promoId           String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  buyer             User            @relation("BuyerOrders", fields: [buyerId], references: [id])
  seller            User            @relation("SellerOrders", fields: [sellerId], references: [id])
  store             Store           @relation(fields: [storeId], references: [id])
  deliveryAddress   DeliveryAddress @relation(fields: [deliveryAddressId], references: [id])
  items             OrderItem[]
  statusHistory     OrderStatusHistory[]
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  productId   String
  productName String
  price       Float
  quantity    Int
  order       Order   @relation(fields: [orderId], references: [id])
  product     Product @relation(fields: [productId], references: [id])
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())
  order     Order       @relation(fields: [orderId], references: [id])
}
```

Also add these relations to existing models:
- User: `wallet Wallet? @relation("BuyerWallet")`, `addresses DeliveryAddress[] @relation("BuyerAddresses")`, `cart Cart? @relation("BuyerCart")`, `buyerOrders Order[] @relation("BuyerOrders")`, `sellerOrders Order[] @relation("SellerOrders")`
- Store: `cart Cart[]`, `orders Order[]`
- Product: `cartItems CartItem[]`, `orderItems OrderItem[]`

Run:
```bash
npx prisma migrate dev --name level3_wallet_cart_order
```

### STEP 3.2 — WALLET & ADDRESS ENDPOINTS

Create `backend/src/controllers/wallet.controller.ts`:
- `GET /api/buyer/wallet` — requireRole BUYER. Auto-create wallet (upsert) if none. Return { balance, transactions (last 20, newest first) }.
- `POST /api/buyer/wallet/topup` — requireRole BUYER. Body: { amount }. Validate: amount must be positive integer, max 10_000_000. Use prisma.$transaction: add amount to wallet.balance, create WalletTransaction { type: TOPUP, amount, description: `Top up Rp ${amount}` }. Return updated wallet.

Create `backend/src/controllers/address.controller.ts`:
- `GET /api/buyer/addresses` — requireRole BUYER. Return all addresses for buyer.
- `POST /api/buyer/addresses` — requireRole BUYER. Body: { label, recipientName, phone, addressLine, city, province, postalCode, isDefault? }. Validate all required. If isDefault=true, first set all existing addresses isDefault=false in same transaction. Create and return address.
- `PUT /api/buyer/addresses/:id` — requireRole BUYER. Verify address.buyerId === userId. Update fields.
- `DELETE /api/buyer/addresses/:id` — requireRole BUYER. Verify ownership. Delete.
- `PATCH /api/buyer/addresses/:id/default` — requireRole BUYER. Verify ownership. Set all buyer's addresses isDefault=false, then set this one true. Return updated.

### STEP 3.3 — CART ENDPOINTS

Create `backend/src/controllers/cart.controller.ts`:

- `GET /api/buyer/cart` — requireRole BUYER. Auto-create cart (upsert) if none. Return cart with items including product { name, price, imageUrl, stock } and store { name }. Include computed subtotal.

- `POST /api/buyer/cart/items` — requireRole BUYER. Body: { productId, quantity }. Logic:
  1. Validate quantity >= 1
  2. Fetch product; if not found or isActive=false return 404
  3. Get or create buyer's cart
  4. **SINGLE-STORE RULE:** if cart.storeId is not null AND cart.storeId !== product.storeId → return 409 { error: "Keranjang sudah berisi produk dari toko lain. Silakan kosongkan keranjang terlebih dahulu.", currentStoreId: cart.storeId }
  5. Check product.stock >= quantity (if new item) or stock >= (existing quantity + quantity)
  6. Upsert CartItem: if exists → increment quantity; if not → create
  7. Set cart.storeId = product.storeId
  8. Return updated cart

- `PUT /api/buyer/cart/items/:itemId` — requireRole BUYER. Body: { quantity }. Validate quantity >= 1. Verify item belongs to buyer's cart. Check stock >= quantity. Update. Return updated cart.

- `DELETE /api/buyer/cart/items/:itemId` — requireRole BUYER. Verify item belongs to buyer's cart. Delete item. If cart is now empty, set cart.storeId = null. Return updated cart.

- `DELETE /api/buyer/cart` — requireRole BUYER. Delete all CartItems for buyer's cart. Set cart.storeId = null. Return { message: "Keranjang dikosongkan" }.

### STEP 3.4 — CHECKOUT ENDPOINT

Create `backend/src/services/checkout.service.ts`:

```typescript
// DELIVERY FEE RULES
export const DELIVERY_FEES: Record<string, number> = {
  INSTANT: 25000,
  NEXT_DAY: 15000,
  REGULAR: 9000,
};

// PPN 12% BASE: subtotal - discount + deliveryFee
// taxAmount = taxBase * 0.12
// finalTotal = subtotal - discount + deliveryFee + taxAmount
```

Implement the checkout function with these steps executed in a single `prisma.$transaction`:
1. Validate cart has items
2. Validate deliveryAddress exists and belongs to buyer
3. Fetch all cart items with products
4. Calculate subtotal = sum(item.product.price * item.quantity)
5. deliveryFee = DELIVERY_FEES[deliveryMethod]
6. discountAmount = 0 (voucher/promo in Level 4)
7. taxBase = subtotal - discountAmount + deliveryFee
8. taxAmount = taxBase * 0.12
9. totalAmount = taxBase + taxAmount
10. Get or create buyer wallet; check balance >= totalAmount → throw "Saldo tidak mencukupi" if not
11. For each cart item: verify product.stock >= item.quantity, then decrement stock (reject if would go negative)
12. Create Order with all calculated amounts, status: SEDANG_DIKEMAS
13. Create OrderItems (snapshot productName = product.name, price = product.price)
14. Create OrderStatusHistory { status: SEDANG_DIKEMAS, note: "Pesanan dibuat" }
15. Deduct wallet.balance by totalAmount
16. Create WalletTransaction { type: PAYMENT, amount: totalAmount, description: `Pembayaran pesanan`, orderId: order.id }
17. Clear cart items, set cart.storeId = null
18. Return full order with items and status history

Create `backend/src/controllers/order.controller.ts`:
- `POST /api/buyer/checkout` — requireRole BUYER. Body: { deliveryAddressId, deliveryMethod }. Call checkout service. Return order.
- `GET /api/buyer/orders` — requireRole BUYER. Return all buyer orders ordered by createdAt desc with store info and current status.
- `GET /api/buyer/orders/:id` — requireRole BUYER. Verify order.buyerId === userId. Return full order with items, status history, delivery address.
- `GET /api/seller/orders` — requireRole SELLER. Return all orders for seller's store, newest first.
- `GET /api/seller/orders/:id` — requireRole SELLER. Verify order.sellerId === userId. Return full order detail.

### STEP 3.5 — BUYER FRONTEND PAGES

**`frontend/app/buyer/wallet/page.tsx`**
- Balance display (large, prominent)
- Top-up form: amount input (quick buttons: 50k, 100k, 500k, 1jt) + custom input + submit
- Transaction history table: date, type badge (TOPUP green / PAYMENT red / REFUND blue), description, amount, running balance

**`frontend/app/buyer/addresses/page.tsx`**
- Address cards with label, recipient, full address, "Default" badge
- Add Address button → modal with full form
- Edit/Delete per address, Set as Default button

**`frontend/app/buyer/cart/page.tsx`**
- Info banner: "SEAPEDIA menggunakan sistem single-store checkout. Satu keranjang hanya bisa berisi produk dari 1 toko."
- Cart items: product info, quantity stepper (-/+), remove button, item subtotal
- Cart summary: subtotal, empty cart button
- "Lanjut Checkout" button → /buyer/checkout
- Empty state if cart is empty

**`frontend/app/buyer/checkout/page.tsx`**
- Step 1: Select delivery address (radio buttons from saved addresses) + "Tambah Alamat Baru" link
- Step 2: Select delivery method (radio cards showing name, estimated time, fee)
- Order Summary card: product list, subtotal, delivery fee, PPN 12%, total
- Wallet balance + warning if insufficient
- Confirm Order button → POST /api/buyer/checkout → redirect to /buyer/orders/:id

**`frontend/app/buyer/orders/page.tsx`**
- Order list: orderId (truncated), store name, items count, total, status badge, date, "Lihat Detail" button

**`frontend/app/buyer/orders/[id]/page.tsx`**
- Order details: items table, delivery address, delivery method
- Price breakdown card: subtotal, discount (Rp 0), delivery fee, PPN 12%, TOTAL (bold)
- Status Timeline: vertical stepper showing each OrderStatusHistory entry with timestamp

**`frontend/app/seller/orders/page.tsx`** — Seller incoming orders table

**`frontend/app/seller/orders/[id]/page.tsx`** — Seller order detail with status timeline

Also update product detail page: add "Tambah ke Keranjang" button for BUYER role users. Handle 409 single-store conflict → show modal "Keranjang Anda berisi produk dari toko lain. Kosongkan keranjang?" with Batal / Kosongkan buttons.

---

### ⏸️ WAIT — VERIFY LEVEL 3

- [ ] Register buyer1@seapedia.com / Buyer123! with role BUYER
- [ ] Top up wallet Rp 500.000 → balance shows correctly, transaction in history
- [ ] Add delivery address
- [ ] Browse products → add product to cart → cart shows 1 item
- [ ] Try adding product from different store → see 409 conflict message
- [ ] Go to cart → adjust quantity → works
- [ ] Go to checkout → see address selector, delivery method selector
- [ ] Checkout summary shows: subtotal, Rp 0 discount, delivery fee, PPN 12%, total
- [ ] Confirm order → redirect to order detail page
- [ ] Order appears in buyer order history with status "Sedang Dikemas"
- [ ] Check wallet balance decreased by totalAmount
- [ ] Check product stock decreased in DB: `SELECT stock FROM Product WHERE id='...'`
- [ ] Order appears in seller1's incoming orders list
- [ ] Try checkout with empty wallet → error "Saldo tidak mencukupi"
- [ ] Cart is empty after successful checkout

### GIT — LEVEL 3

```bash
git add .
git commit -m "feat: level 3 - buyer wallet, delivery addresses, cart with single-store rule, checkout with PPN 12%"
git push origin main
```

---

## ═══════════════════════════════════════
## LEVEL 4 — DISCOUNTS & SELLER ORDER PROCESSING (15 pts)
## ═══════════════════════════════════════

### STEP 4.1 — UPDATE PRISMA SCHEMA

Add to schema.prisma:

```prisma
enum DiscountType {
  PERCENTAGE
  FIXED
}

model Voucher {
  id            String       @id @default(cuid())
  code          String       @unique
  description   String
  discountType  DiscountType
  discountValue Float
  minOrderAmount Float       @default(0)
  maxUsage      Int
  usedCount     Int          @default(0)
  expiresAt     DateTime
  createdAt     DateTime     @default(now())
  orders        Order[]      @relation("OrderVoucher")
}

model Promo {
  id            String       @id @default(cuid())
  code          String       @unique
  description   String
  discountType  DiscountType
  discountValue Float
  minOrderAmount Float       @default(0)
  expiresAt     DateTime
  createdAt     DateTime     @default(now())
  orders        Order[]      @relation("OrderPromo")
}
```

Update Order model: change `voucherId String?` and `promoId String?` to proper FK relations:
```prisma
voucher   Voucher? @relation("OrderVoucher", fields: [voucherId], references: [id])
promo     Promo?   @relation("OrderPromo", fields: [promoId], references: [id])
```

Run:
```bash
npx prisma migrate dev --name level4_voucher_promo
```

Update seed.ts to add:
```typescript
// Voucher: 10% off, min order 50k, max 100 uses, expires 1 year
// Voucher: Fixed Rp 20.000 off, min order 100k, max 50 uses, expires 1 year
// Promo: 5% off, no min, unlimited uses, expires 1 year
// Run seed again
```

### STEP 4.2 — DISCOUNT ENDPOINTS

Create `backend/src/controllers/discount.controller.ts`:

Admin endpoints (all requireRole ADMIN):
- `POST /api/admin/vouchers` — Body: { code, description, discountType, discountValue, minOrderAmount, maxUsage, expiresAt }. Validate code is unique. Return created voucher.
- `GET /api/admin/vouchers` — Return all vouchers with computed status (ACTIVE/EXPIRED/EXHAUSTED)
- `GET /api/admin/vouchers/:id` — Return voucher detail
- `POST /api/admin/promos` — Body: { code, description, discountType, discountValue, minOrderAmount, expiresAt }. Return created promo.
- `GET /api/admin/promos` — Return all promos
- `GET /api/admin/promos/:id` — Return promo detail

Public validation endpoints:
- `GET /api/vouchers/validate?code=XXX&subtotal=YYY` — Check: code exists, not expired (expiresAt > now), usedCount < maxUsage, subtotal >= minOrderAmount. Return { valid: true, voucher: {...}, discountAmount } or { valid: false, reason: "..." }
- `GET /api/promos/validate?code=XXX&subtotal=YYY` — Same but no usage limit check

### STEP 4.3 — UPDATE CHECKOUT SERVICE

Update `backend/src/services/checkout.service.ts`:

Accept optional `voucherCode` and `promoCode` in parameters.

Discount calculation logic (run BEFORE PPN):
```
1. Validate voucher (if provided): not expired, has remaining usage, subtotal >= minOrderAmount
2. Validate promo (if provided): not expired, subtotal >= minOrderAmount
3. Calculate voucherDiscount:
   - PERCENTAGE: subtotal * (discountValue / 100)
   - FIXED: discountValue
   - Cap at subtotal
4. Calculate promoDiscount on (subtotal - voucherDiscount):
   - Apply same logic
5. discountAmount = voucherDiscount + promoDiscount (cannot exceed subtotal)
6. taxBase = subtotal - discountAmount + deliveryFee
7. taxAmount = taxBase * 0.12
8. totalAmount = taxBase + taxAmount
9. In the transaction: increment voucher.usedCount if voucher used
10. Set order.voucherId and order.promoId
```

Document clearly in README: "Discount stacks: voucher applied first on subtotal, promo applied on remaining amount. PPN 12% base = subtotal - totalDiscount + deliveryFee."

### STEP 4.4 — SELLER ORDER PROCESSING

Add to `backend/src/controllers/order.controller.ts`:

- `PATCH /api/seller/orders/:id/process` — requireRole SELLER. Verify order.sellerId matches user's sellerId (fetch seller's store, check store.sellerId === userId). Verify order.status === 'SEDANG_DIKEMAS' (else 400: "Pesanan tidak dapat diproses pada status saat ini"). Use prisma.$transaction: update order.status = MENUNGGU_PENGIRIM, create OrderStatusHistory { status: MENUNGGU_PENGIRIM, note: "Diproses oleh penjual" }. Return updated order.

### STEP 4.5 — REPORTS ENDPOINTS

Add to order controller:
- `GET /api/buyer/reports` — requireRole BUYER. Return: totalSpent (sum of totalAmount where status=PESANAN_SELESAI), orderCount, recentOrders array with full breakdown.
- `GET /api/seller/reports` — requireRole SELLER. Return: totalIncome (sum of orders where sellerId matches and status=PESANAN_SELESAI), ordersByMonth grouped data, recentCompletedOrders.

### STEP 4.6 — FRONTEND UPDATES

**Update `frontend/app/buyer/checkout/page.tsx`**:
- Add voucher code input + "Terapkan" button → calls GET /api/vouchers/validate
- Add promo code input + "Terapkan" button → calls GET /api/promos/validate
- Show applied discount lines in summary:
  - Subtotal: Rp X
  - Voucher (CODE): -Rp X (green text)
  - Promo (CODE): -Rp X (green text)
  - Ongkos Kirim: Rp X
  - PPN 12%: Rp X
  - **TOTAL: Rp X**

**Update seller order pages**:
- `/seller/orders/[id]/page.tsx`: Add "Proses Pesanan" button if status === SEDANG_DIKEMAS. On click → PATCH /api/seller/orders/:id/process. Show OrderStatusTimeline.
- `/seller/orders/page.tsx`: Add status filter tabs

**`frontend/app/buyer/reports/page.tsx`**:
- Stats: total spent, order count
- Bar chart by month (use recharts, install: `npm install recharts`)
- Orders table

**`frontend/app/seller/reports/page.tsx`**:
- Stats: total income, completed orders
- Bar chart by month
- Orders breakdown table

---

### ⏸️ WAIT — VERIFY LEVEL 4

- [ ] Login as admin@seapedia.com → /admin/dashboard
- [ ] Create a voucher SAVE10 (10% off, min 50k, max 100 uses, 1 year expiry) from admin panel
- [ ] Login as buyer, checkout with voucher SAVE10 → discount shows in summary
- [ ] Checkout with invalid/expired code → error shown
- [ ] Checkout with both voucher + promo → both discounts shown, PPN calculated on discounted amount
- [ ] Seller processes order → status changes to "Menunggu Pengirim"
- [ ] Status timeline shows both SEDANG_DIKEMAS and MENUNGGU_PENGIRIM with timestamps
- [ ] Non-owning seller cannot process another seller's order → 403
- [ ] Buyer reports page shows spending

### GIT — LEVEL 4

```bash
git add .
git commit -m "feat: level 4 - voucher/promo discounts with stacking, seller order processing, buyer/seller reports"
git push origin main
```

---

## ═══════════════════════════════════════
## LEVEL 5 — DELIVERY & DRIVER WORKFLOW (10 pts)
## ═══════════════════════════════════════

### STEP 5.1 — UPDATE PRISMA SCHEMA

Add to schema.prisma:

```prisma
enum JobStatus {
  AVAILABLE
  TAKEN
  COMPLETED
}

model DeliveryJob {
  id           String    @id @default(cuid())
  orderId      String    @unique
  driverId     String?
  status       JobStatus @default(AVAILABLE)
  earnedAmount Float?
  takenAt      DateTime?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())

  order        Order     @relation(fields: [orderId], references: [id])
  driver       User?     @relation("DriverJobs", fields: [driverId], references: [id])
}
```

Add to User model: `driverJobs DeliveryJob[] @relation("DriverJobs")`
Add to Order model: `deliveryJob DeliveryJob?`

Run:
```bash
npx prisma migrate dev --name level5_delivery_job
```

### STEP 5.2 — AUTO-CREATE JOB ON SELLER PROCESSING

Update the `PATCH /api/seller/orders/:id/process` handler:
After updating order status to MENUNGGU_PENGIRIM, inside the same prisma.$transaction, also create:
```typescript
prisma.deliveryJob.create({
  data: { orderId: order.id, status: 'AVAILABLE' }
})
```
<truncated 27596 bytes>

NOTE: The output was truncated because it was too long. Use a more targeted query or a smaller range to get the information you need.