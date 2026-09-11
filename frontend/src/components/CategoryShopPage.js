import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCartItem } from '../services/cart';
import { checkoutProduct } from '../services/payments';
import { categoryOptions } from './CategoryBar';

const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

async function fetchCategoryProducts(category, page = 1) {
    const query = new URLSearchParams({ page: String(page), limit: '8' });
    if (category) query.set('category', category);
    const response = await fetch(`${apiUrl}/api/store/products?${query}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load category products');
    return result;
}

export default function CategoryShopPage({ token, onSignOut }) {
    const { category } = useParams();
    const decodedCategory = decodeURIComponent(category || '');
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [addingProduct, setAddingProduct] = useState('');
    const [payingProduct, setPayingProduct] = useState('');

    const subcategories = useMemo(() => {
        const base = ['All', 'New arrivals', 'Best sellers', 'Essentials', 'On sale'];
        return decodedCategory ? [decodedCategory, ...base.filter((item) => item !== decodedCategory)] : base;
    }, [decodedCategory]);

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        fetchCategoryProducts(decodedCategory, 1)
            .then((result) => {
                if (!active) return;
                setProducts(result.data || []);
                setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.message);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => { active = false; };
    }, [decodedCategory]);

    async function handleAddToCart(product) {
        setError('');
        setAddingProduct(product.id);
        try {
            await addCartItem(token, product.id);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setAddingProduct('');
        }
    }

    async function handleBuy(product) {
        setError('');
        setPayingProduct(product.id);
        try {
            await checkoutProduct({ token, product, quantity: 1 });
            const refreshed = await fetchCategoryProducts(decodedCategory, pagination.page || 1);
            setProducts(refreshed.data || []);
            setPagination(refreshed.pagination || { page: 1, pages: 1, total: 0 });
        } catch (requestError) {
            setError(requestError.message);
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
                    <Link to='/shop'>Shop</Link>
                    <Link to='/cart'>Cart</Link>
                    <Link to='/orders'>My orders</Link>
                    <button className='account-signout transition-colors' onClick={onSignOut}>Sign out</button>
                </nav>
            </header>

            <div className='category-bar'>
                <div className='category-bar-inner'>
                    {categoryOptions.map((option) => (
                        <Link
                            key={option}
                            className={`category-bar-link ${decodedCategory === option ? 'active' : ''}`}
                            to={`/shop/category/${encodeURIComponent(option)}`}
                        >
                            {option}
                        </Link>
                    ))}
                </div>
            </div>

            <section className='account-wrap px-4 sm:px-6'>
                <div className='category-layout'>
                    <aside className='category-sidebar'>
                        <h2>Browse {decodedCategory || 'all categories'}</h2>
                        <ul>
                            {subcategories.map((subcategory) => (
                                <li key={subcategory}>
                                    <button type='button' className={`subcategory-link ${subcategory === decodedCategory ? 'selected' : ''}`}>
                                        {subcategory}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <div className='category-content'>
                        <div className='cart-heading'>
                            <div>
                                <p className='login-kicker'>North & Co.</p>
                                <h1>{decodedCategory || 'All products'}</h1>
                                <p className='heading-copy'>Curated picks for your everyday routine.</p>
                            </div>
                            <Link className='cart-back-link' to='/shop'>Back to shop</Link>
                        </div>

                        {error && <p className='login-error' role='alert'>{error}</p>}

                        {isLoading ? (
                            <p className='cart-empty'>Loading products...</p>
                        ) : (
                            <div className='store-grid'>
                                {products.map((product) => {
                                    const productImage = product.image || product.images?.[0] || '';
                                    return (
                                        <article className='store-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg' key={product.id}>
                                            {productImage ? (
                                                <img className='product-image' src={productImage} alt={product.name} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                                            ) : (
                                                <div className={`store-swatch ${product.category?.toLowerCase() || 'accessories'}`} />
                                            )}
                                            <p className='store-category'>{product.category}</p>
                                            <h2>{product.name}</h2>
                                            <p>{product.description}</p>
                                            <strong>${Number(product.price).toFixed(2)}</strong>
                                            <button className='cart-button' disabled={Boolean(addingProduct)} onClick={() => handleAddToCart(product)}>
                                                {addingProduct === product.id ? 'Adding...' : 'Add to cart'}
                                            </button>
                                            <button className='buy-button' disabled={Boolean(payingProduct)} onClick={() => handleBuy(product)}>
                                                {payingProduct === product.id ? 'Opening checkout...' : 'Buy now'}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
