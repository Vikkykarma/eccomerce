import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearSession } from '../services/auth';
import { addCartItem } from '../services/cart';
import { checkoutProduct } from '../services/payments';
import { loadProducts } from '../store/productsSlice';
import CategoryBar from './CategoryBar';

export default function CustomerAccount({ onSignOut }) {
    const dispatch = useDispatch();
    const {
        items: products,
        pagination,
        error,
    } = useSelector((state) => state.products);
    const token = useSelector((state) => state.auth.token);
    const [paymentError, setPaymentError] = useState('');
    const [payingProduct, setPayingProduct] = useState('');
    const [cartError, setCartError] = useState('');
    const [addingProduct, setAddingProduct] = useState('');
    const signOut = () => {
        clearSession();
        onSignOut();
    };
    useEffect(() => {
        if (products.length === 0) dispatch(loadProducts(1));
    }, [dispatch, products.length]);
    const page = pagination.page || 1;

    async function handleAddToCart(product) {
        setCartError('');
        setAddingProduct(product.id);
        try {
            await addCartItem(token, product.id);
        } catch (requestError) {
            setCartError(requestError.message);
        } finally {
            setAddingProduct('');
        }
    }

    async function handleBuy(product) {
        setPaymentError('');
        setPayingProduct(product.id);
        try {
            await checkoutProduct({ token, product, quantity: 1 });
            dispatch(loadProducts(page));
        } catch (paymentRequestError) {
            setPaymentError(paymentRequestError.message);
        } finally {
            setPayingProduct('');
        }
    }

    return (
        <main className='account-page min-h-screen'>
            <header className='account-header px-4 sm:px-6'>
                <div className='login-brand'>
                    <span className='brand-mark'>n</span>
                    <strong>northand</strong>
                </div>
                <nav className='account-nav'>
                    <Link to='/cart'>Cart</Link>
                    <Link to='/orders'>My orders</Link>
                    <Link to='/account'>profile</Link>
                    <button
                        className='account-signout transition-colors'
                        onClick={signOut}
                    >
                        Sign out
                    </button>
                </nav>
            </header>
            <CategoryBar />
            <section className='account-wrap px-4 sm:px-6'>
                <p className='login-kicker'>North & Co. store</p>
                <h1>Explore the collection</h1>
                <p className='heading-copy'>Thoughtful goods for everyday living.</p>
                {(error || paymentError || cartError) && (
                    <p className='login-error' role='alert'>
                        {error || paymentError || cartError}
                    </p>
                )}
                <div className='store-grid'>
                    {products.map((product) => {
                        const productImage = product.image || product.images?.[0] || '';
                        return (
                            <article
                                className='store-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg'
                                key={product.id}
                            >
                                {productImage ? (
                                    <img
                                        className='product-image'
                                        src={productImage}
                                        alt={product.name}
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className={`store-swatch ${product.category.toLowerCase()}`}
                                    />
                                )}
                                <p className='store-category'>{product.category}</p>
                                <h2>{product.name}</h2>
                                <p>{product.description}</p>
                                <strong>${Number(product.price).toFixed(2)}</strong>
                                <button
                                    className='cart-button'
                                    disabled={Boolean(addingProduct)}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    {addingProduct === product.id ? 'Adding...' : 'Add to cart'}
                                </button>
                                <button
                                    className='buy-button'
                                    disabled={Boolean(payingProduct)}
                                    onClick={() => handleBuy(product)}
                                >
                                    {payingProduct === product.id
                                        ? 'Opening checkout...'
                                        : 'Buy now'}
                                </button>
                            </article>
                        );
                    })}
                </div>
                <div className='pagination flex-wrap' aria-label='Product pages'>
                    <button
                        className='transition-colors hover:border-orange-500'
                        disabled={page === 1}
                        onClick={() => dispatch(loadProducts(page - 1))}
                    >
                        ← Previous
                    </button>
                    <span>
                        Page {page} of {Math.max(pagination.pages, 1)} · {pagination.total}{' '}
                        products
                    </span>
                    <button
                        className='transition-colors hover:border-orange-500'
                        disabled={page >= pagination.pages}
                        onClick={() => dispatch(loadProducts(page + 1))}
                    >
                        Next →
                    </button>
                </div>
            </section>
        </main>
    );
}
