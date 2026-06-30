"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.selectRole = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const JWT_SECRET = process.env.JWT_SECRET;
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(30),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    roles: zod_1.z.array(zod_1.z.enum(['SELLER', 'BUYER', 'DRIVER'])).min(1),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const register = async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { username, email, password, roles } = parsed.data;
    const existing = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing)
        return res.status(409).json({ error: 'Email or username already taken' });
    const hashed = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: {
            username, email, password: hashed,
            roles: { create: roles.map(r => ({ role: r })) },
        },
        include: { roles: true },
    });
    res.status(201).json({ message: 'Registered successfully', user: { id: user.id, username: user.username, email: user.email, roles: user.roles.map(r => r.role) } });
};
exports.register = register;
const login = async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email }, include: { roles: true } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials' });
    const roles = user.roles.map(r => r.role);
    const payload = { userId: user.id, roles };
    if (roles.length === 1) {
        payload.activeRole = roles[0];
    }
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, roles },
        requiresRoleSelection: roles.length > 1 && !roles.includes('ADMIN'),
    });
};
exports.login = login;
const selectRole = async (req, res) => {
    const { role } = req.body;
    if (!role)
        return res.status(400).json({ error: 'Role is required' });
    if (!req.user.roles.includes(role))
        return res.status(403).json({ error: 'You do not have this role' });
    const newToken = jsonwebtoken_1.default.sign({ ...req.user, activeRole: role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: newToken, activeRole: role });
};
exports.selectRole = selectRole;
const logout = async (req, res) => {
    const token = (0, auth_middleware_1.extractToken)(req);
    if (token)
        (0, auth_middleware_1.blacklistToken)(token);
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const me = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { roles: true },
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({
        id: user.id, username: user.username, email: user.email,
        roles: user.roles.map(r => r.role),
        activeRole: req.user.activeRole,
    });
};
exports.me = me;
