const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function paymentRequest(path, token, body) {
    const response = await fetch(`${apiUrl}/api/payments/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Payment request failed');
    return result;
}

export function createPaymentOrder(token, productId, quantity = 1) {
    return paymentRequest('create-order', token, { productId, quantity });
}

export function verifyPayment(token, paymentDetails) {
    return paymentRequest('verify', token, paymentDetails);
}

export function loadRazorpayCheckout() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
        document.body.appendChild(script);
    });
}

export function checkoutProduct({ token, product, quantity = 1 }) {
    return new Promise(async (resolve, reject) => {
        try {
            await loadRazorpayCheckout();
            const productId = product.id || product._id;
            const order = await createPaymentOrder(token, productId, quantity);

            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'North & Co.',
                description: product.name,
                order_id: order.razorpayOrderId,
                handler: async (payment) => {
                    try {
                        const result = await verifyPayment(token, { ...payment, productId, quantity });
                        resolve(result);
                    } catch (verificationError) {
                        reject(verificationError);
                    }
                },
                modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
            });

            checkout.open();
        } catch (error) {
            reject(error);
        }
    });
}
