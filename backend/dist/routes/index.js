"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Auth
router.post('/auth/register', auth_controller_1.register);
router.post('/auth/login', auth_controller_1.login);
router.post('/auth/select-role', auth_middleware_1.verifyToken, auth_controller_1.selectRole);
router.post('/auth/logout', auth_middleware_1.verifyToken, auth_controller_1.logout);
router.get('/auth/me', auth_middleware_1.verifyToken, auth_controller_1.me);
// Reviews
router.post('/reviews', (req, res, next) => { (0, auth_middleware_1.verifyToken)(req, res, (err) => { if (err)
    return next(); next(); }); }, review_controller_1.createReview);
router.get('/reviews', review_controller_1.getReviews);
// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
exports.default = router;
