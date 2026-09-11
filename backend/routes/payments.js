import crypto from 'node:crypto';
import { Router } from 'express';
import Razorpay from 'razorpay';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export function createPaymentRouter(config, requireUser) {
    const router = Router();
    const razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
    });

    router.post('/create-order', requireUser, async (request, response, next) => {
        const { productId, quantity = 1 } = request.body;
        const numericQuantity = Number(quantity);

        if (
            !productId ||
            !Number.isInteger(numericQuantity) ||
            numericQuantity < 1
        ) {
            return response
                .status(400)
                .json({
                    error: 'productId and a positive integer quantity are required',
                });
        }

        try {
            const product = await Product.findById(productId);
            if (!product)
                return response.status(404).json({ error: 'Product not found' });
            if (product.stock < numericQuantity)
                return response
                    .status(409)
                    .json({ error: 'Requested quantity is not available' });

            const amount = product.price * numericQuantity;
            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
            });
            return response
                .status(201)
                .json({
                    keyId: config.razorpayKeyId,
                    razorpayOrderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    product: {
                        id: product._id,
                        name: product.name,
                        quantity: numericQuantity,
                    },
                });
        } catch (error) {
            return next(error);
        }
    });

    router.post('/verify', requireUser, async (request, response, next) => {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            razorpay_order_id: razorpayOrderIdAlt,
            razorpay_payment_id: razorpayPaymentIdAlt,
            razorpay_signature: razorpaySignatureAlt,
            productId,
            quantity = 1,
        } = request.body;

        const normalizedOrderId = razorpayOrderId || razorpayOrderIdAlt;
        const normalizedPaymentId = razorpayPaymentId || razorpayPaymentIdAlt;
        const normalizedSignature = razorpaySignature || razorpaySignatureAlt;
        const numericQuantity = Number(quantity);
        const payload = `${normalizedOrderId}|${normalizedPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', config.razorpayKeySecret)
            .update(payload)
            .digest('hex');

        if (
            !normalizedOrderId ||
            !normalizedPaymentId ||
            !normalizedSignature ||
            expectedSignature !== normalizedSignature
        ) {
            return response
                .status(400)
                .json({ error: 'Payment signature verification failed' });
        }

        try {
            const [user, product] = await Promise.all([
                User.findById(request.user.id),
                Product.findById(productId),
            ]);
            if (
                !user ||
                !product ||
                !Number.isInteger(numericQuantity) ||
                numericQuantity < 1
            )
                return response
                    .status(400)
                    .json({ error: 'Invalid payment order data' });
            if (product.stock < numericQuantity)
                return response
                    .status(409)
                    .json({ error: 'Product stock is no longer available' });

            const amount = product.price * numericQuantity;
            const savedOrder = await Order.create({
                id: `order_${Date.now()}`,
                user: user._id,
                customer: user.name,
                items: [
                    {
                        product: product._id,
                        name: product.name,
                        quantity: numericQuantity,
                        price: product.price,
                    },
                ],
                date: new Date().toISOString(),
                amount,
                status: 'Paid',
                payment: {
                    provider: 'razorpay',
                    razorpayOrderId: normalizedOrderId,
                    razorpayPaymentId: normalizedPaymentId,
                    razorpaySignature: normalizedSignature,
                },
            });

            const cart = await Cart.findOne({ user: user._id });
            if (cart) {
                cart.items = cart.items.filter(
                    (item) => item.product.toString() !== product._id.toString()
                );
                await cart.save();
            }

            await Product.updateOne(
                { _id: product._id },
                { $inc: { stock: -numericQuantity, sold: numericQuantity } }
            );
            return response.status(201).json({ order: savedOrder });
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
