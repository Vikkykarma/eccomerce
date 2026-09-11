import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeCartItem } from '../services/cart';
import { checkoutProduct } from '../services/payments';

export default function CartPage({ token, onSignOut }) {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [] });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState('');
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        fetchCart(token)
            .then(setCart)
            .catch((requestError) => setError(requestError.message))
            .finally(() => setIsLoading(false));
    }, [token]);

    async function handleRemove(productId) {
        setRemovingId(productId);
        setError('');
        try {
            setCart(await removeCartItem(token, productId));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setRemovingId('');
        }
    }

    async function handleCheckout() {
        if (!items.length) return;

        setError('');
        setCheckingOut(true);

        try {
            for (const item of items) {
                const product = item.product || {};
                const productId = product._id || product.id;
                if (!productId) continue;
                await checkoutProduct({ token, product, quantity: item.quantity });
            }

            const refreshedCart = await fetchCart(token);
            setCart(refreshedCart);
            navigate('/orders');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setCheckingOut(false);
        }
    }

    const items = cart.items || [];
    const total = items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
        0
    );
    return (
        <main className='account-page min-h-screen'>
            <header className='account-header px-4 sm:px-6'>
                <div className='login-brand'>
                    <span className='brand-mark'>n</span>
                    <strong>northand</strong>
                </div>
                <nav className='account-nav'>
                    <Link to='/shop'>Shop</Link>
                    <Link to='/orders'>My orders</Link>
                    <Link to='/account'>My account</Link>
                    <button
                        className='account-signout transition-colors'
                        onClick={onSignOut}
                    >
                        Sign out
                    </button>
                </nav>
            </header>
            <section className='account-wrap px-4 sm:px-6'>
                <div className='cart-heading'>
                    <div>
                        <p className='login-kicker'>Your account</p>
                        <h1>Your cart</h1>
                        <p className='heading-copy'>
                            Review the products you want to take home.
                        </p>
                    </div>
                    <Link className='cart-back-link' to='/shop'>
                        Continue shopping
                    </Link>
                </div>
                {error && (
                    <p className='login-error' role='alert'>
                        {error}
                    </p>
                )}
                {isLoading ? (
                    <p className='cart-empty'>Loading cart...</p>
                ) : items.length === 0 ? (
                    <div className='cart-empty'>
                        <h2>Your cart is empty</h2>
                        <p>Add products from the shop to see them here.</p>
                        <Link className='primary-button cart-shop-link' to='/shop'>
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className='cart-layout'>
                        <div className='cart-items'>
                            {items.map((item) => {
                                const product = item.product || {};
                                const productId = product._id || product.id;
                                return (
                                    <article className='cart-item' key={productId}>
                                        <div className='cart-item-swatch' />
                                        <div className='cart-item-info'>
                                            <p className='store-category'>{product.category}</p>
                                            <h2>{product.name}</h2>
                                            <p>Quantity: {item.quantity}</p>
                                        </div>
                                        <strong>
                                            ${(Number(product.price || 0) * item.quantity).toFixed(2)}
                                        </strong>
                                        <button
                                            className='remove-cart-button'
                                            disabled={removingId === productId}
                                            onClick={() => handleRemove(productId)}
                                        >
                                            {removingId === productId ? 'Removing...' : 'Remove'}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                        <aside className='cart-summary'>
                            <h2>Order summary</h2>
                            <div>
                                <span>Items</span>
                                <strong>
                                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                                </strong>
                            </div>
                            <div className='cart-total'>
                                <span>Total</span>
                                <strong>${total.toFixed(2)}</strong>
                            </div>
                            <button className='buy-button' disabled={checkingOut} onClick={handleCheckout}>
                                {checkingOut ? 'Processing...' : 'Checkout'}
                            </button>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
