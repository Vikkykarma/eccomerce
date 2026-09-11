const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function cartRequest(token, path, options = {}) {
    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to update cart');
    return result;
}

export function fetchCart(token) {
    return cartRequest(token, '/api/users/cart');
}

export function addCartItem(token, productId, quantity = 1) {
    return cartRequest(token, '/api/users/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
}

export function removeCartItem(token, productId) {
    return cartRequest(token, `/api/users/cart/items/${productId}`, { method: 'DELETE' });
}
