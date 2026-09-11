import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { serializeUser } from '../utils/serializers.js';

export function createAuthRouter(config, requireAdmin) {
    const router = Router();

    router.post('/login', (request, response) => {
        const { email, password } = request.body;
        const normalizedEmail = String(email ?? '').trim().toLowerCase();
        const configuredEmail = String(config.adminEmail ?? '').trim().toLowerCase();

        if (normalizedEmail !== configuredEmail || password !== config.adminPassword) {
            return response.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: config.adminEmail, role: config.adminRole }, config.jwtSecret, { expiresIn: '8h' });
        return response.json({ token, user: { email: config.adminEmail, role: config.adminRole } });
    });

    router.get('/me', requireAdmin, (request, response) => response.json({ user: request.admin }));
    return router;
}

export function createUserRouter(config, requireUser) {
    const router = Router();

    router.post('/register', async (request, response, next) => {
        const { name, email, password } = request.body;
        if (!name || !email || !password || password.length < 8) return response.status(400).json({ error: 'name, email, and a password of at least 8 characters are required' });
        try {
            const normalizedEmail = email.trim().toLowerCase();
            if (await User.findOne({ email: normalizedEmail })) return response.status(409).json({ error: 'An account with this email already exists' });
            const role = normalizedEmail === config.adminEmail.trim().toLowerCase() ? 'admin' : 'user';
            const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role });
            await Cart.create({ user: user._id, items: [] });
            const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '8h' });
            return response.status(201).json({ token, user: serializeUser(user) });
        } catch (error) { return next(error); }
    });

    router.post('/login', async (request, response, next) => {
        try {
            const user = await User.findOne({ email: request.body.email?.trim().toLowerCase() });
            if (!user || !(await bcrypt.compare(request.body.password || '', user.passwordHash))) return response.status(401).json({ error: 'Invalid email or password' });
            const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '8h' });
            return response.json({ token, user: serializeUser(user) });
        } catch (error) { return next(error); }
    });

    router.get('/me', requireUser, async (request, response, next) => {
        try {
            const user = await User.findById(request.user.id);
            if (!user) return response.status(404).json({ error: 'User not found' });
            return response.json({ user: serializeUser(user) });
        } catch (error) { return next(error); }
    });

    router.get('/cart', requireUser, async (request, response, next) => {
        try {
            const cart = await Cart.findOne({ user: request.user.id }).populate('items.product');
            return response.json(cart || { user: request.user.id, items: [] });
        } catch (error) { return next(error); }
    });

    router.get('/orders', requireUser, async (request, response, next) => {
        try {
            const orders = await Order.find({ user: request.user.id }).sort({ createdAt: -1 }).lean();
            return response.json(orders);
        } catch (error) { return next(error); }
    });

    router.post('/cart/items', requireUser, async (request, response, next) => {
        const { productId, quantity = 1 } = request.body;
        const numericQuantity = Number(quantity);
        if (!mongoose.isValidObjectId(productId) || !Number.isInteger(numericQuantity) || numericQuantity < 1) return response.status(400).json({ error: 'productId and a positive integer quantity are required' });

        try {
            const product = await Product.findById(productId);
            if (!product) return response.status(404).json({ error: 'Product not found' });
            const cart = await Cart.findOneAndUpdate({ user: request.user.id }, { $setOnInsert: { user: request.user.id, items: [] } }, { new: true, upsert: true });
            const item = cart.items.find((entry) => entry.product.toString() === productId);
            if (item) item.quantity += numericQuantity;
            else cart.items.push({ product: product._id, quantity: numericQuantity });
            await cart.save();
            return response.status(201).json(await cart.populate('items.product'));
        } catch (error) { return next(error); }
    });

    router.delete('/cart/items/:productId', requireUser, async (request, response, next) => {
        try {
            const cart = await Cart.findOneAndUpdate({ user: request.user.id }, { $pull: { items: { product: request.params.productId } } }, { new: true }).populate('items.product');
            return response.json(cart || { user: request.user.id, items: [] });
        } catch (error) { return next(error); }
    });
    return router;
}
