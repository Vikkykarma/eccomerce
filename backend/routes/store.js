import { Router } from 'express';
import { Product } from '../models/Product.js';
import { serializeProduct } from '../utils/stock.js';

export function createStoreRouter() {
    const router = Router();

    router.get('/products', async (request, response, next) => {
        const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 8, 1), 50);
        const search = request.query.search?.trim();
        const category = request.query.category?.trim();
        const filter = {};

        if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
        if (category) filter.category = category;

        try {
            const [items, total] = await Promise.all([
                Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
                Product.countDocuments(filter),
            ]);
            return response.json({
                data: items.map(serializeProduct),
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) { return next(error); }
    });

    return router;
}
