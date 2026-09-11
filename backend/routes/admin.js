import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { serializeProduct } from '../utils/stock.js';
import { productPhotos } from '../middleware/upload.js';
import { uploadImage } from '../config/cloudinary.js';

export function createAdminRouter(requireAdmin, cloudinaryClient) {
    const router = Router();
    router.use(requireAdmin);

    router.get('/dashboard', async (_request, response, next) => {
        try {
            const [products, orders] = await Promise.all([Product.find().sort({ sold: -1 }).limit(4).lean(), Order.find().sort({ createdAt: -1 }).limit(4).lean()]);
            const totalRevenue = orders.reduce((total, order) => total + order.amount, 0);
            const totalOrders = await Order.countDocuments();
            return response.json({ metrics: { totalRevenue, orders: totalOrders, averageOrderValue: totalOrders ? Number((totalRevenue / totalOrders).toFixed(2)) : 0, conversionRate: 0 }, trafficSources: [], topProducts: products.map(serializeProduct), recentOrders: orders });
        } catch (error) { return next(error); }
    });

    router.get('/products', async (_request, response, next) => { try { return response.json((await Product.find().sort({ createdAt: -1 })).map(serializeProduct)); } catch (error) { return next(error); } });
    router.post('/products', async (request, response, next) => {
        const { name, category, price, stock = 0 } = request.body;
        const numericPrice = Number(price); const numericStock = Number(stock);
        if (!name || !category || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) return response.status(400).json({ error: 'name, category, price, and a non-negative integer stock are required' });
        try { const product = await Product.create({ name: name.trim(), category: category.trim(), price: numericPrice, stock: numericStock, sold: 0 }); return response.status(201).json(serializeProduct(product)); } catch (error) { return next(error); }
    });
    router.post('/products/with-photos', productPhotos.array('photos', 8), async (request, response, next) => {
        const { name, category, description = '', price, stock = 0 } = request.body;
        const numericPrice = Number(price); const numericStock = Number(stock);
        if (!name || !category || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) return response.status(400).json({ error: 'name, category, price, and a non-negative integer stock are required' });
        if (!request.files?.length) return response.status(400).json({ error: 'At least one product photo is required' });
        try {
            const uploads = await Promise.all(request.files.map((file) => uploadImage(cloudinaryClient, file.buffer)));
            const images = uploads.map((upload) => upload.secure_url);
            const product = await Product.create({ name: name.trim(), category: category.trim(), description: description.trim(), price: numericPrice, stock: numericStock, sold: 0, image: images[0], images });
            return response.status(201).json(serializeProduct(product));
        } catch (error) { return next(error); }
    });
    router.get('/orders', async (_request, response, next) => { try { return response.json(await Order.find().sort({ createdAt: -1 }).lean()); } catch (error) { return next(error); } });
    router.patch('/orders/:id', async (request, response, next) => {
        const allowedStatuses = ['Paid', 'Processing', 'Shipped', 'Cancelled'];
        if (!allowedStatuses.includes(request.body.status)) return response.status(400).json({ error: `status must be one of: ${allowedStatuses.join(', ')}` });
        try { const order = await Order.findOneAndUpdate({ id: request.params.id }, { status: request.body.status }, { new: true }).lean(); if (!order) return response.status(404).json({ error: 'Order not found' }); return response.json(order); } catch (error) { return next(error); }
    });
    return router;
}
