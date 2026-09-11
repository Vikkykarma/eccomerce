import AdminDashboardView from './AdminDashboardView';

export default function AdminDashboard({ onSignOut, token }) {
    return <AdminDashboardView onSignOut={onSignOut} token={token} />;
}
