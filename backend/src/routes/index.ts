import { Router } from 'express';
import { register, login, logout, me, selectRole } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { createStore, getOwnStore, updateStore, getStoreById } from '../controllers/store.controller';
import { createProduct, getSellerProducts, updateProduct, deleteProduct, getPublicProducts, getPublicProductById } from '../controllers/product.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { getWallet, topUpWallet } from '../controllers/wallet.controller';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address.controller';
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { checkout, getBuyerOrders, getBuyerOrderById, getSellerOrders, getSellerOrderById, processSellerOrder, getBuyerReports, getSellerReports } from '../controllers/order.controller';
import { createVoucher, getVouchers, getVoucherById, createPromo, getPromos, getPromoById, validateVoucher, validatePromo } from '../controllers/discount.controller';

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

// Buyer Wallet
router.get('/buyer/wallet', verifyToken, requireRole('BUYER'), getWallet);
router.post('/buyer/wallet/topup', verifyToken, requireRole('BUYER'), topUpWallet);

// Buyer Addresses
router.get('/buyer/addresses', verifyToken, requireRole('BUYER'), getAddresses);
router.post('/buyer/addresses', verifyToken, requireRole('BUYER'), createAddress);
router.put('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), updateAddress);
router.delete('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), deleteAddress);
router.patch('/buyer/addresses/:id/default', verifyToken, requireRole('BUYER'), setDefaultAddress);

// Buyer Cart
router.get('/buyer/cart', verifyToken, requireRole('BUYER'), getCart);
router.post('/buyer/cart/items', verifyToken, requireRole('BUYER'), addCartItem);
router.put('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), updateCartItem);
router.delete('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), removeCartItem);
router.delete('/buyer/cart', verifyToken, requireRole('BUYER'), clearCart);

// Buyer Checkout & Orders
router.post('/buyer/checkout', verifyToken, requireRole('BUYER'), checkout);
router.get('/buyer/orders', verifyToken, requireRole('BUYER'), getBuyerOrders);
router.get('/buyer/orders/:id', verifyToken, requireRole('BUYER'), getBuyerOrderById);
router.get('/buyer/reports', verifyToken, requireRole('BUYER'), getBuyerReports);

// Seller Orders
router.get('/seller/orders', verifyToken, requireRole('SELLER'), getSellerOrders);
router.get('/seller/orders/:id', verifyToken, requireRole('SELLER'), getSellerOrderById);
router.patch('/seller/orders/:id/process', verifyToken, requireRole('SELLER'), processSellerOrder);
router.get('/seller/reports', verifyToken, requireRole('SELLER'), getSellerReports);

// Admin Discounts
router.post('/admin/vouchers', verifyToken, requireRole('ADMIN'), createVoucher);
router.get('/admin/vouchers', verifyToken, requireRole('ADMIN'), getVouchers);
router.get('/admin/vouchers/:id', verifyToken, requireRole('ADMIN'), getVoucherById);
router.post('/admin/promos', verifyToken, requireRole('ADMIN'), createPromo);
router.get('/admin/promos', verifyToken, requireRole('ADMIN'), getPromos);
router.get('/admin/promos/:id', verifyToken, requireRole('ADMIN'), getPromoById);

// Public Validation Discounts
router.get('/vouchers/validate', validateVoucher);
router.get('/promos/validate', validatePromo);

export default router;
