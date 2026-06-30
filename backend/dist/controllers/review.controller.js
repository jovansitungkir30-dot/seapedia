"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.createReview = void 0;
const zod_1 = require("zod");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const prisma_1 = require("../utils/prisma");
const reviewSchema = zod_1.z.object({
    reviewerName: zod_1.z.string().min(1).max(100),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(1).max(500),
});
const sanitize = (str) => (0, sanitize_html_1.default)(str, { allowedTags: [], allowedAttributes: {} });
const createReview = async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { reviewerName, rating, comment } = parsed.data;
    const review = await prisma_1.prisma.applicationReview.create({
        data: {
            reviewerName: sanitize(reviewerName),
            rating,
            comment: sanitize(comment),
            userId: req.user?.userId ?? null,
        },
    });
    res.status(201).json(review);
};
exports.createReview = createReview;
const getReviews = async (_req, res) => {
    const reviews = await prisma_1.prisma.applicationReview.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json(reviews);
};
exports.getReviews = getReviews;
