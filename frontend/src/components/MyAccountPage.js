import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCart } from '../services/cart';

const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

async function fetchProfile(token) {
    const response = await fetch(`${apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load your profile');
    return result.user;
}

async function fetchOrders(token) {
    const response = await fetch(`${apiUrl}/api/users/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load your orders');
    return result;
}

export default function MyAccountPage({ token, onSignOut }) {
    const [profile, setProfile] = useState(null);
    const [cart, setCart] = useState({ items: [] });
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        Promise.all([
            fetchProfile(token),
            fetchCart(token),
            fetchOrders(token),
        ])
            .then(([profileData, cartData, ordersData]) => {
                setProfile(profileData);
                setCart(cartData || { items: [] });
                setOrders(ordersData || []);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setIsLoading(false));
    }, [token]);

    const items = cart.items || [];
    const cartItemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const cartTotal = items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * (item.quantity || 0),
        0
    );
    const latestOrder = orders[0];

    return (
        <main className='account-page min-h-screen'>
            <header className='account-header px-4 sm:px-6'>
                <div className='login-brand'>
                    <span className='brand-mark'>n</span>
                    <strong>Ecommerce</strong>
                </div>
                <nav className='account-nav'>
                    <Link to='/shop'>Shop</Link>
                    <Link to='/cart'>Cart</Link>
                    <Link to='/orders'>My orders</Link>
                    <Link to='/account'>My account</Link>
                    <button className='account-signout transition-colors' onClick={onSignOut}>Sign out</button>
                </nav>
            </header>

            <section className='account-wrap px-4 sm:px-6'>
                <div className='cart-heading'>
                    <div>
                        <p className='login-kicker'>Your account</p>
                        <h1>My account</h1>
                        <p className='heading-copy'>See your profile, recent purchases, and current cart at a glance.</p>
                    </div>
                    <Link className='cart-back-link' to='/shop'>Continue shopping</Link>
                </div>

                {error && <p className='login-error' role='alert'>{error}</p>}

                {isLoading ? (
                    <p className='cart-empty'>Loading account details...</p>
                ) : (
                    <>
                        <div className='account-overview-grid'>
                            <article className='account-summary-card'>
                                <h2>Personal details</h2>
                                {profile ? (
                                    <dl className='account-detail-list'>
                                        <div>
                                            <dt>Name</dt>
                                            <dd>{profile.name}</dd>
                                        </div>
                                        <div>
                                            <dt>Email</dt>
                                            <dd>{profile.email}</dd>
                                        </div>
                                        <div>
                                            <dt>Role</dt>
                                            <dd>{profile.role || 'user'}</dd>
                                        </div>
                                    </dl>
                                ) : (
                                    <p className='empty-state'>Your personal details are unavailable right now.</p>
                                )}
                            </article>

                            <article className='account-summary-card'>
                                <h2>Cart</h2>
                                <div className='account-metric'>
                                    <strong>{cartItemCount}</strong>
                                    <span>items in cart</span>
                                </div>
                                <p className='account-total'>Total: ${cartTotal.toFixed(2)}</p>
                                <Link className='primary-button cart-shop-link' to='/cart'>View cart</Link>
                            </article>

                            <article className='account-summary-card'>
                                <h2>Latest order</h2>
                                {latestOrder ? (
                                    <>
                                        <div className='account-metric'>
                                            <strong>#{latestOrder.id || latestOrder._id}</strong>
                                            <span>{new Date(latestOrder.date || latestOrder.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className='account-total'>Status: {latestOrder.status}</p>
                                        <p className='account-total'>Amount: ${Number(latestOrder.amount || 0).toFixed(2)}</p>
                                    </>
                                ) : (
                                    <p className='empty-state'>You have not placed any orders yet.</p>
                                )}
                            </article>
                        </div>

                        <div className='account-section'>
                            <div className='account-section-header'>
                                <h2>Recent orders</h2>
                                <Link to='/orders'>View all</Link>
                            </div>
                            {orders.length === 0 ? (
                                <div className='cart-empty'>
                                    <h2>No orders yet</h2>
                                    <p>Your latest orders will appear once you complete a purchase.</p>
                                    <Link className='primary-button cart-shop-link' to='/shop'>Browse products</Link>
                                </div>
                            ) : (
                                <div className='cart-items'>
                                    {orders.slice(0, 3).map((order) => (
                                        <article className='cart-item' key={order.id || order._id}>
                                            <div className='cart-item-swatch' />
                                            <div className='cart-item-info'>
                                                <p className='store-category'>Order #{order.id || order._id}</p>
                                                <h2>{order.items?.[0]?.name || 'Purchased item'}</h2>
                                                <p>{new Date(order.date || order.createdAt).toLocaleDateString()} · Qty: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</p>
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
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
