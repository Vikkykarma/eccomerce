import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ role }) {
    const { token, role: currentRole } = useSelector((state) => state.auth);
    if (!token) return <Navigate to="/login" replace />;
    if (role && currentRole !== role) return <Navigate to={currentRole === 'admin' ? '/admin' : '/shop'} replace />;
    return <Outlet />;
}
