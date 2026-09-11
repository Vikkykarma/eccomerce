import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

async function fetchOrders(token) {
    const response = await fetch(`${apiUrl}/api/users/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load orders');
    return result;
}

export default function MyOrdersPage({ token, onSignOut }) {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders(token)
            .then(setOrders)
            .catch((requestError) => setError(requestError.message))
            .finally(() => setIsLoading(false));
    }, [token]);

    return (
        <main className='account-page min-h-screen'>
            <header className='account-header px-4 sm:px-6'>
                <div className='login-brand'>
                    <span className='brand-mark'>n</span>
                    <strong>northand</strong>
                </div>
                <nav className='account-nav'>
                    <Link to='/shop'>Shop</Link>
                    <Link to='/cart'>Cart</Link>
                    <Link to='/account'>My account</Link>
                    <button className='account-signout transition-colors' onClick={onSignOut}>Sign out</button>
                </nav>
            </header>

            <section className='account-wrap px-4 sm:px-6'>
                <div className='cart-heading'>
                    <div>
                        <p className='login-kicker'>Your account</p>
                        <h1>My orders</h1>
                        <p className='heading-copy'>Track your latest purchases and delivery status.</p>
                    </div>
                    <Link className='cart-back-link' to='/shop'>Continue shopping</Link>
                </div>

                {error && <p className='login-error' role='alert'>{error}</p>}

                {isLoading ? (
                    <p className='cart-empty'>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <div className='cart-empty'>
                        <h2>No orders yet</h2>
                        <p>Your recent purchases will appear here after checkout.</p>
                        <Link className='primary-button cart-shop-link' to='/shop'>Browse products</Link>
                    </div>
                ) : (
                    <div className='cart-items'>
                        {orders.map((order) => (
                            <article className='cart-item' key={order.id || order._id}>
                                <div className='cart-item-swatch' />
                                <div className='cart-item-info'>
                                    <p className='store-category'>Order #{order.id}</p>
                                    <h2>{order.items?.[0]?.name || 'Purchased item'}</h2>
                                    <p>{new Date(order.date || order.createdAt).toLocaleDateString()} · Qty: {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
                                </div>
                                <div className='cart-item-info'>
                                    <p className='store-category'>Status</p>
                                    <strong>{order.status}</strong>
                                </div>
                                <strong>${Number(order.amount || 0).toFixed(2)}</strong>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
