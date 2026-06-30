import { Router } from 'express';
import { register, login, logout, me, selectRole } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { createStore, getOwnStore, updateStore, getStoreById } from '../controllers/store.controller';
import { createProduct, getSellerProducts, updateProduct, deleteProduct, getPublicProducts, getPublicProductById } from '../controllers/product.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', verifyToken, me);
router.post('/auth/select-role', verifyToken, selectRole);

// Review routes
router.post('/reviews', createReview);
router.get('/reviews', getReviews);

// Store routes
router.post('/seller/store', verifyToken, requireRole('SELLER'), createStore);
router.get('/seller/store', verifyToken, requireRole('SELLER'), getOwnStore);
router.put('/seller/store', verifyToken, requireRole('SELLER'), updateStore);
router.get('/stores/:id', getStoreById);

// Product routes
router.post('/seller/products', verifyToken, requireRole('SELLER'), createProduct);
router.get('/seller/products', verifyToken, requireRole('SELLER'), getSellerProducts);
router.put('/seller/products/:id', verifyToken, requireRole('SELLER'), updateProduct);
router.delete('/seller/products/:id', verifyToken, requireRole('SELLER'), deleteProduct);
router.get('/products', getPublicProducts);
router.get('/products/:id', getPublicProductById);

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

export default router;
