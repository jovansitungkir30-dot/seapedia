"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractToken = exports.requireRole = exports.verifyToken = exports.blacklistToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const tokenBlacklist = new Set();
const blacklistToken = (token) => tokenBlacklist.add(token);
exports.blacklistToken = blacklistToken;
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Token has been invalidated' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.verifyToken = verifyToken;
const requireRole = (role) => (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.activeRole !== role) {
        return res.status(403).json({ error: `This action requires ${role} role. Your active role is ${req.user.activeRole || 'none'}.` });
    }
    next();
};
exports.requireRole = requireRole;
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
        return null;
    return authHeader.split(' ')[1];
};
exports.extractToken = extractToken;
