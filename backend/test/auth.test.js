import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';

import { createApp } from '../app.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const config = {
    port: 0,
    jwtSecret: 'test-secret',
    adminEmail: 'Admin@Example.com',
    adminPassword: 'StrongPass123',
    adminRole: 'admin',
    mongoUri: 'mongodb://127.0.0.1:27017/ecommerce-test',
    frontendOrigin: 'http://localhost:3000',
    razorpayKeyId: 'test-key',
    razorpayKeySecret: 'test-secret',
    cloudinaryCloudName: 'test-cloud',
    cloudinaryApiKey: 'test-api-key',
    cloudinaryApiSecret: 'test-api-secret',
};

test('admin login accepts mixed-case email', async () => {
    const app = createApp(config);
    const server = createServer(app);
    server.listen(0);
    await once(server, 'listening');

    try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'StrongPass123' }),
        });

        assert.equal(response.status, 200, 'login should succeed for a case-insensitive admin email');
        const body = await response.json();
        assert.equal(body.user.email, 'Admin@Example.com');
        assert.equal(body.user.role, 'admin');
        assert.ok(body.token, 'a JWT token should be returned');
    } finally {
        server.close();
    }
});

test('payment verification accepts Razorpay callback payload keys', async () => {
    await mongoose.connect(config.mongoUri);
    const user = await User.create({
        name: 'Payment User',
        email: `payment-${Date.now()}@example.com`,
        passwordHash: 'placeholder',
        role: 'user',
    });
    const product = await Product.create({
        name: 'Test item',
        category: 'Accessories',
        description: 'Sample',
        price: 20,
        stock: 15,
        sold: 0,
    });

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: 'user' }, config.jwtSecret, { expiresIn: '8h' });
    const razorpayOrderId = 'order_test_123';
    const razorpayPaymentId = 'pay_test_456';
    const signature = crypto.createHmac('sha256', config.razorpayKeySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');

    const app = createApp(config);
    const server = createServer(app);
    server.listen(0);
    await once(server, 'listening');

    try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}/api/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: signature,
                productId: product._id.toString(),
                quantity: 1,
            }),
        });

        const body = await response.json();
        assert.equal(response.status, 201, `expected success but got ${response.status}: ${JSON.stringify(body)}`);
        assert.equal(body.order.payment.razorpayOrderId, razorpayOrderId);
        assert.equal(body.order.payment.razorpayPaymentId, razorpayPaymentId);
    } finally {
        await mongoose.disconnect();
        server.close();
    }
});

test('successful payment removes cart item and exposes order history', async () => {
    await mongoose.connect(config.mongoUri);
    const user = await User.create({
        name: 'Order User',
        email: `orders-${Date.now()}@example.com`,
        passwordHash: 'placeholder',
        role: 'user',
    });
    const product = await Product.create({
        name: 'Order item',
        category: 'Home',
        description: 'Sample order item',
        price: 25,
        stock: 10,
        sold: 0,
    });

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: 'user' }, config.jwtSecret, { expiresIn: '8h' });
    const cart = await mongoose.model('Cart').create({ user: user._id, items: [{ product: product._id, quantity: 2 }] });
    const razorpayOrderId = 'order_test_cleanup';
    const razorpayPaymentId = 'pay_test_cleanup';
    const signature = crypto.createHmac('sha256', config.razorpayKeySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');

    const app = createApp(config);
    const server = createServer(app);
    server.listen(0);
    await once(server, 'listening');

    try {
        const { port } = server.address();
        const verifyResponse = await fetch(`http://127.0.0.1:${port}/api/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: signature,
                productId: product._id.toString(),
                quantity: 2,
            }),
        });
        assert.equal(verifyResponse.status, 201, 'payment verify should succeed');

        const orderResponse = await fetch(`http://127.0.0.1:${port}/api/users/orders`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        const orders = await orderResponse.json();
        assert.equal(orderResponse.status, 200, 'user order history should be available');
        assert.equal(orders.length, 1, 'one order should be returned for the user');
        assert.equal(orders[0].status, 'Paid');

        const refreshedCart = await mongoose.model('Cart').findOne({ user: user._id }).lean();
        assert.deepEqual(refreshedCart.items, [], 'the purchased cart item should be removed after payment');
    } finally {
        await mongoose.disconnect();
        server.close();
    }
});
