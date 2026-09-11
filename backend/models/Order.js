import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, integer: true },
    price: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    payment: {
        provider: { type: String, enum: ['razorpay'], default: 'razorpay' },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
    },
    status: { type: String, enum: ['Paid', 'Processing', 'Shipped', 'Cancelled'], required: true },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
