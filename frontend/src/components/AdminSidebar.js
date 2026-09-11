const navItems = [
    { label: 'Overview', icon: 'grid' },
    { label: 'Orders', icon: 'bag' },
    { label: 'Products', icon: 'box' },
    { label: 'Customers', icon: 'users' },
    { label: 'Analytics', icon: 'chart' },
];

export default function AdminSidebar({ activeItem, onNavigate, onSignOut }) {
    return <aside className="sidebar"><div className="sidebar-top"><div className="brand"><span className="brand-mark">n</span><span>northand</span></div><button className="signout-button" type="button" aria-label="Sign out of admin panel" title="Sign out" onClick={onSignOut}>↪ <span>Sign out</span></button></div><div className="workspace-switcher"><span className="workspace-avatar">N</span><span><strong>North & Co.</strong><small>Online store</small></span><span className="chevron">⌄</span></div><nav className="main-nav" aria-label="Main navigation"><p className="nav-label">Workspace</p>{navItems.map((item) => <button className={`nav-item ${activeItem === item.label ? 'active' : ''}`} key={item.label} onClick={() => onNavigate(item.label)}><span className={`nav-icon ${item.icon}`} aria-hidden="true" /><span>{item.label}</span>{item.count && <span className="nav-count">{item.count}</span>}</button>)}<p className="nav-label nav-label-spaced">Manage</p><button className="nav-item" onClick={() => onNavigate('Settings')}><span className="nav-icon settings" aria-hidden="true" /><span>Settings</span></button><button className="nav-item" onClick={() => onNavigate('Help center')}><span className="nav-icon help" aria-hidden="true" /><span>Help center</span></button></nav><div className="sidebar-bottom"><div className="upgrade-card"><span className="spark">✦</span><strong>Make your store shine</strong><p>Unlock more tools to grow your business.</p><button>Explore Pro <span>→</span></button></div><div className="profile"><span className="profile-avatar">AM</span><span><strong>Alex Morgan</strong><small>Administrator</small></span></div></div></aside>;
}
