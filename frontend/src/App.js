import { useState } from 'react';
import './App.css';
import AppRouter from './components/AppRouter';

const navItems = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Orders', icon: 'bag', count: '12' },
  { label: 'Products', icon: 'box' },
  { label: 'Customers', icon: 'users' },
  { label: 'Analytics', icon: 'chart' },
];

const products = [
  { name: 'Canvas Weekender', category: 'Travel', price: '$128.00', stock: 'In stock', sold: '284', color: 'sand' },
  { name: 'Everyday Ribbed Tee', category: 'Apparel', price: '$42.00', stock: 'In stock', sold: '219', color: 'blue' },
  { name: 'Ceramic Pour Over', category: 'Home', price: '$68.00', stock: 'Low stock', sold: '86', color: 'cream' },
  { name: 'Leather Card Holder', category: 'Accessories', price: '$54.00', stock: 'Out of stock', sold: '41', color: 'clay' },
];

const orders = [
  { id: '#1048', customer: 'Olivia Martin', date: 'Today, 10:24 AM', amount: '$128.00', status: 'Paid' },
  { id: '#1047', customer: 'Noah Williams', date: 'Today, 9:15 AM', amount: '$210.00', status: 'Processing' },
  { id: '#1046', customer: 'Emma Davis', date: 'Yesterday, 4:42 PM', amount: '$68.00', status: 'Paid' },
  { id: '#1045', customer: 'Liam Brown', date: 'Yesterday, 1:08 PM', amount: '$54.00', status: 'Shipped' },
];

const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

export function App() {
  const [activeItem, setActiveItem] = useState('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('auth_role') || 'admin');
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const isCustomer = authRole === 'user';
      const endpoint = isCustomer && authMode === 'register' ? '/api/users/register' : isCustomer ? '/api/users/login' : '/api/auth/login';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        body: JSON.stringify(isCustomer && authMode === 'register' ? { name, email, password } : { email, password }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in');
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('auth_role', isCustomer ? 'user' : 'admin');
      setAuthRole(isCustomer ? 'user' : 'admin');
      setToken(result.token);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-brand"><span className="brand-mark">n</span><strong>northand</strong></div>
          <div className="auth-tabs"><button className={authRole === 'admin' ? 'selected' : ''} onClick={() => { setAuthRole('admin'); setAuthMode('login'); }}>Admin</button><button className={authRole === 'user' ? 'selected' : ''} onClick={() => setAuthRole('user')}>Customer</button></div>
          <p className="login-kicker">{authRole === 'admin' ? 'Seller Central' : 'North & Co. account'}</p>
          <h1>{authRole === 'user' && authMode === 'register' ? 'Create your account' : `Sign in to your ${authRole === 'admin' ? 'admin panel' : 'account'}`}</h1>
          <p className="login-copy">{authRole === 'admin' ? 'Manage your store, products, and orders from one place.' : 'Save your details and keep track of every order.'}</p>
          <form onSubmit={handleLogin}>
            {authRole === 'user' && authMode === 'register' && <><label htmlFor="user-name">Full name</label><input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></>}
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            {loginError && <p className="login-error" role="alert">{loginError}</p>}
            <button className="login-button" type="submit" disabled={isLoggingIn}>{isLoggingIn ? 'Please wait...' : authRole === 'user' && authMode === 'register' ? 'Create account' : 'Sign in'}</button>
          </form>
          {authRole === 'user' && <button className="auth-switch" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setLoginError(''); }}>{authMode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>}
          <small className="login-note">{authRole === 'admin' ? 'Admin access is required to continue.' : 'Your account data stays protected.'}</small>
        </section>
      </main>
    );
  }

  if (authRole === 'user') {
    return (
      <main className="account-page">
        <header className="account-header"><div className="login-brand"><span className="brand-mark">n</span><strong>northand</strong></div><button className="account-signout" onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('auth_role'); setToken(null); }}>Sign out</button></header>
        <section className="account-wrap"><p className="login-kicker">My account</p><h1>Welcome back</h1><p className="heading-copy">Your North & Co. account is ready.</p><div className="account-grid"><article className="account-card"><span className="account-card-icon">◎</span><h2>Orders</h2><p>View your recent purchases and delivery status.</p><button>View orders <span>→</span></button></article><article className="account-card"><span className="account-card-icon">◇</span><h2>Profile details</h2><p>Keep your name, email, and delivery details up to date.</p><button>Manage profile <span>→</span></button></article><article className="account-card"><span className="account-card-icon">♡</span><h2>Saved items</h2><p>Products you want to come back to later.</p><button>Browse products <span>→</span></button></article></div></section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">n</span><span>northand</span></div>
        <div className="workspace-switcher"><span className="workspace-avatar">N</span><span><strong>North & Co.</strong><small>Online store</small></span><span className="chevron">⌄</span></div>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item) => (
            <button className={`nav-item ${activeItem === item.label ? 'active' : ''}`} key={item.label} onClick={() => setActiveItem(item.label)}>
              <span className={`nav-icon ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">Manage</p>
          <button className="nav-item" onClick={() => setActiveItem('Settings')}><span className="nav-icon settings" aria-hidden="true" /><span>Settings</span></button>
          <button className="nav-item" onClick={() => setActiveItem('Help center')}><span className="nav-icon help" aria-hidden="true" /><span>Help center</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="upgrade-card"><span className="spark">✦</span><strong>Make your store shine</strong><p>Unlock more tools to grow your business.</p><button>Explore Pro <span>→</span></button></div><div className="profile"><span className="profile-avatar">AM</span><span><strong>Alex Morgan</strong><small>Administrator</small></span><button aria-label="Sign out" onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('auth_role'); setToken(null); }}>↪</button></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeItem}</strong></div><div className="top-actions"><button className="search-button" aria-label="Search"><span className="search-icon" /></button><button className="notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><span className="bell-icon" /><i /></button><button className="store-button">View store <span>↗</span></button></div>{showNotifications && <div className="notification-popover"><strong>Notifications</strong><p>Your weekly report is ready to view.</p><p>12 orders need your attention.</p></div>}</header>
        <section className="content-wrap">
          <div className="page-heading"><div><p className="eyebrow">Sunday, June 16, 2024</p><h1>Good morning, Alex <span>✦</span></h1><p className="heading-copy">Here is what is happening with your store today.</p></div><button className="primary-button"><span>+</span> Add product</button></div>

          <div className="metric-grid">
            <article className="metric-card"><div className="metric-top"><span>Total revenue</span><span className="metric-icon revenue">$</span></div><strong>$24,680.00</strong><p className="trend up">↑ 12.8% <span>vs last month</span></p></article>
            <article className="metric-card"><div className="metric-top"><span>Orders</span><span className="metric-icon orders">↗</span></div><strong>184</strong><p className="trend up">↑ 8.2% <span>vs last month</span></p></article>
            <article className="metric-card"><div className="metric-top"><span>Average order value</span><span className="metric-icon average">◈</span></div><strong>$134.13</strong><p className="trend down">↓ 2.4% <span>vs last month</span></p></article>
            <article className="metric-card"><div className="metric-top"><span>Conversion rate</span><span className="metric-icon conversion">%</span></div><strong>3.42%</strong><p className="trend up">↑ 0.6% <span>vs last month</span></p></article>
          </div>

          <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-header"><div><h2>Revenue overview</h2><p>Track your sales performance over time.</p></div><select defaultValue="30"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">This year</option></select></div><div className="chart-summary"><strong>$24,680</strong><span className="trend up">↑ 12.8%</span><small>vs previous period</small></div><div className="chart"><div className="y-labels"><span>$6k</span><span>$4k</span><span>$2k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Revenue trending upward over the last 30 days"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b7d6cc" stopOpacity=".6" /><stop offset="100%" stopColor="#b7d6cc" stopOpacity=".03" /></linearGradient></defs><path className="chart-fill" d="M0,183 C35,176 43,155 72,164 S110,184 136,153 S179,132 207,143 S239,116 267,129 S300,127 327,101 S368,113 397,98 S427,74 455,91 S483,111 514,83 S552,68 575,82 S607,64 632,40 S665,43 700,18 L700,220 L0,220Z" /><path className="chart-line" d="M0,183 C35,176 43,155 72,164 S110,184 136,153 S179,132 207,143 S239,116 267,129 S300,127 327,101 S368,113 397,98 S427,74 455,91 S483,111 514,83 S552,68 575,82 S607,64 632,40 S665,43 700,18" /></svg><div className="x-labels"><span>May 18</span><span>May 25</span><span>Jun 1</span><span>Jun 8</span><span>Jun 16</span></div></div></div></section><section className="panel traffic-panel"><div className="panel-header"><div><h2>Traffic sources</h2><p>Where your visitors come from.</p></div><button className="more-button" aria-label="More traffic source options">•••</button></div><div className="donut-wrap"><div className="donut"><div><strong>18.4k</strong><span>visitors</span></div></div><div className="legend"><div><i className="dot direct" /><span>Direct</span><strong>42%</strong></div><div><i className="dot search" /><span>Organic search</span><strong>31%</strong></div><div><i className="dot social" /><span>Social media</span><strong>18%</strong></div><div><i className="dot referral" /><span>Referral</span><strong>9%</strong></div></div></div></section></div>

          <div className="lower-grid"><section className="panel table-panel"><div className="panel-header"><div><h2>Top products</h2><p>Your best performing products this month.</p></div><button className="text-button">View all <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Status</th><th>Sold</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.name}><td><div className="product-cell"><span className={`product-swatch ${product.color}`} /><span><strong>{product.name}</strong><small>{product.category}</small></span></div></td><td>{product.price}</td><td><span className={`status ${product.stock.toLowerCase().replace(' ', '-')}`}>{product.stock}</span></td><td>{product.sold}</td><td><button className="row-more" aria-label={`More options for ${product.name}`}>•••</button></td></tr>)}</tbody></table></div></section><section className="panel orders-panel"><div className="panel-header"><div><h2>Recent orders</h2><p>Latest activity in your store.</p></div><button className="text-button">View all <span>→</span></button></div><div className="orders-list">{orders.map((order) => <div className="order-row" key={order.id}><span className="order-avatar">{order.customer.split(' ').map((name) => name[0]).join('')}</span><div className="order-info"><strong>{order.customer}</strong><small>{order.id} · {order.date}</small></div><div className="order-value"><strong>{order.amount}</strong><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></div></div>)}</div></section></div>
        </section>
      </main>
    </div>
  );
}

void App;

export default AppRouter;
