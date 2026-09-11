import { useEffect, useState } from 'react';
import { fetchDashboard } from '../services/admin';
import AdminSidebar from './AdminSidebar';
import ProductForm from './ProductForm';

export default function AdminDashboardView({ onSignOut, token }) {
    const [activeItem, setActiveItem] = useState('Overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [showProductForm, setShowProductForm] = useState(false);
    const signOut = () => onSignOut();
    useEffect(() => {
        let isMounted = true;
        fetchDashboard(token)
            .then((result) => {
                if (isMounted) setDashboard(result);
            })
            .catch((error) => {
                if (isMounted) setLoadError(error.message);
            });
        return () => {
            isMounted = false;
        };
    }, [token]);
    async function handleProductCreated() {
        setShowProductForm(false);
        try {
            setLoadError('');
            setDashboard(await fetchDashboard(token));
        } catch (error) {
            setLoadError(error.message);
        }
    }
    const dashboardProducts = dashboard?.topProducts || [];
    const dashboardOrders = dashboard?.recentOrders || [];
    return (
        <div className='app-shell min-h-screen antialiased'>
            <AdminSidebar
                activeItem={activeItem}
                onNavigate={setActiveItem}
                onSignOut={signOut}
            />
            <main className='main-content'>
                <header className='topbar px-4 sm:px-6 lg:px-10'>
                    <div className='breadcrumb'>
                        <span>Workspace</span>
                        <b>/</b>
                        <strong>{activeItem}</strong>
                    </div>
                    <div className='top-actions'>
                        <button
                            className='search-button transition-colors hover:text-orange-600'
                            aria-label='Search'
                        >
                            <span className='search-icon' />
                        </button>
                        <button
                            className='notification-button'
                            aria-label='Notifications'
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <span className='bell-icon' />
                            <i />
                        </button>
                        <button className='store-button transition-colors hover:border-orange-600 hover:text-orange-600'>
                            View store <span>↗</span>
                        </button>
                    </div>
                    {showNotifications && (
                        <div className='notification-popover'>
                            <strong>Notifications</strong>
                            <p>Your weekly report is ready to view.</p>
                            <p>12 orders need your attention.</p>
                        </div>
                    )}
                </header>
                <section className='content-wrap px-4 sm:px-6 lg:px-10'>
                    {loadError && (
                        <p className='login-error' role='alert'>
                            {loadError}
                        </p>
                    )}
                    <div className='page-heading flex-wrap gap-5'>
                        <div>
                            <p className='eyebrow'>Sunday, June 16, 2024</p>
                            <h1>
                                Good morning, Alex <span>✦</span>
                            </h1>
                            <p className='heading-copy'>
                                Here is what is happening with your store today.
                            </p>
                        </div>
                        <button
                            className='primary-button transition-colors hover:bg-orange-500'
                            onClick={() => setShowProductForm(true)}
                        >
                            <span>+</span> Add product
                        </button>
                    </div>
                    <MetricGrid metrics={dashboard?.metrics} />
                    <DashboardPanels
                        products={dashboardProducts}
                        orders={dashboardOrders}
                    />
                </section>
            </main>
            {showProductForm && (
                <ProductForm
                    token={token}
                    onClose={() => setShowProductForm(false)}
                    onCreated={handleProductCreated}
                />
            )}
        </div>
    );
}
function MetricGrid({ metrics }) {
    return (
        <div className='metric-grid'>
            <Metric
                label='Total revenue'
                value={`$${(metrics?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon='$'
            />
            <Metric
                label='Orders'
                value={metrics?.orders ?? 0}
                icon='↗'
                tone='orders'
            />
            <Metric
                label='Average order value'
                value={`$${(metrics?.averageOrderValue ?? 0).toFixed(2)}`}
                icon='◈'
                tone='average'
            />
            <Metric
                label='Conversion rate'
                value={`${metrics?.conversionRate ?? 0}%`}
                icon='%'
                tone='conversion'
            />
        </div>
    );
}
function Metric({ label, value, trend, icon, tone = 'revenue', down }) {
    return (
        <article className='metric-card'>
            <div className='metric-top'>
                <span>{label}</span>
                <span className={`metric-icon ${tone}`}>{icon}</span>
            </div>
            <strong>{value}</strong>
            <p className={`trend ${down ? 'down' : 'up'}`}>
                {trend} <span>vs last month</span>
            </p>
        </article>
    );
}
function PanelHeader({ title, copy }) {
    return (
        <div className='panel-header'>
            <div>
                <h2>{title}</h2>
                <p>{copy}</p>
            </div>
            <button className='text-button'>
                View all <span>→</span>
            </button>
        </div>
    );
}
function DashboardPanels({
    products: dashboardProducts,
    orders: dashboardOrders,
}) {
    return (
        <>
            <div className='dashboard-grid'>
                <section className='panel revenue-panel'>
                    <PanelHeader
                        title='Revenue overview'
                        copy='Track your sales performance over time.'
                    />
                    <div className='chart-summary'>
                        <strong>$24,680</strong>
                        <span className='trend up'>↑ 12.8%</span>
                        <small>vs previous period</small>
                    </div>
                    <div className='chart'>
                        <div className='y-labels'>
                            <span>$6k</span>
                            <span>$4k</span>
                            <span>$2k</span>
                            <span>$0</span>
                        </div>
                        <div className='chart-area'>
                            <div className='grid-lines'>
                                <i />
                                <i />
                                <i />
                                <i />
                            </div>
                            <svg
                                viewBox='0 0 700 220'
                                preserveAspectRatio='none'
                                role='img'
                                aria-label='Revenue trending upward over the last 30 days'
                            >
                                <path
                                    className='chart-line'
                                    d='M0,183 C35,176 43,155 72,164 S110,184 136,153 S179,132 207,143 S239,116 267,129 S300,127 327,101 S368,113 397,98 S427,74 455,91 S483,111 514,83 S552,68 575,82 S607,64 632,40 S665,43 700,18'
                                />
                            </svg>
                            <div className='x-labels'>
                                <span>May 18</span>
                                <span>May 25</span>
                                <span>Jun 1</span>
                                <span>Jun 8</span>
                                <span>Jun 16</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='panel traffic-panel'>
                    <PanelHeader
                        title='Traffic sources'
                        copy='Where your visitors come from.'
                    />
                    <div className='donut-wrap'>
                        <div className='donut'>
                            <div>
                                <strong>18.4k</strong>
                                <span>visitors</span>
                            </div>
                        </div>
                        <div className='legend'>
                            <div>
                                <i className='dot direct' />
                                Direct <strong>42%</strong>
                            </div>
                            <div>
                                <i className='dot search' />
                                Organic search <strong>31%</strong>
                            </div>
                            <div>
                                <i className='dot social' />
                                Social media <strong>18%</strong>
                            </div>
                            <div>
                                <i className='dot referral' />
                                Referral <strong>9%</strong>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <div className='lower-grid'>
                <section className='panel table-panel'>
                    <PanelHeader
                        title='Top products'
                        copy='Your best performing products this month.'
                    />
                    <div className='table-wrap'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Sold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardProducts.map((product) => (
                                    <tr key={product.name}>
                                        <td>
                                            <div className='product-cell'>
                                                <span
                                                    className={`product-swatch ${product.color || 'sand'}`}
                                                />
                                                <span>
                                                    <strong>{product.name}</strong>
                                                    <small>{product.category}</small>
                                                </span>
                                            </div>
                                        </td>
                                        <td>${Number(product.price).toFixed(2)}</td>
                                        <td>
                                            <span
                                                className={`status ${(product.stockStatus || product.stock).toLowerCase().replace(' ', '-')}`}
                                            >
                                                {product.stockStatus || product.stock}
                                            </span>
                                        </td>
                                        <td>{product.sold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className='panel orders-panel'>
                    <PanelHeader
                        title='Recent orders'
                        copy='Latest activity in your store.'
                    />
                    <div className='orders-list'>
                        {dashboardOrders.map((order) => (
                            <div className='order-row' key={order.id}>
                                <span className='order-avatar'>
                                    {order.customer
                                        .split(' ')
                                        .map((name) => name[0])
                                        .join('')}
                                </span>
                                <div className='order-info'>
                                    <strong>{order.customer}</strong>
                                    <small>
                                        {order.id} · {order.date}
                                    </small>
                                </div>
                                <div className='order-value'>
                                    <strong>${Number(order.amount).toFixed(2)}</strong>
                                    <span
                                        className={`order-status ${order.status.toLowerCase()}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
