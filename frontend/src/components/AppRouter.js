import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboardView from './AdminDashboardView';
import AuthScreen from './AuthScreen';
import CartPage from './CartPage';
import CategoryShopPage from './CategoryShopPage';
import CustomerAccount from './CustomerAccount';
import MyAccountPage from './MyAccountPage';
import MyOrdersPage from './MyOrdersPage';
import ProtectedRoute from './ProtectedRoute';
import { signOut } from '../store/authSlice';

export default function AppRouter() {
    const dispatch = useDispatch();
    const { token, role } = useSelector((state) => state.auth);

    function handleSignOut() { dispatch(signOut()); }

    const homePath = token ? (role === 'admin' ? '/admin' : '/shop') : '/login';
    return <Routes>
        <Route path="/login" element={<AuthScreen mode="login" />} />
        <Route path="/register" element={<AuthScreen mode="register" />} />
        <Route element={<ProtectedRoute role="user" />}>
            <Route path="/shop" element={<CustomerAccount onSignOut={handleSignOut} />} />
            <Route path="/shop/category/:category" element={<CategoryShopPage token={token} onSignOut={handleSignOut} />} />
            <Route path="/cart" element={<CartPage token={token} onSignOut={handleSignOut} />} />
            <Route path="/orders" element={<MyOrdersPage token={token} onSignOut={handleSignOut} />} />
            <Route path="/account" element={<MyAccountPage token={token} onSignOut={handleSignOut} />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboardView token={token} onSignOut={handleSignOut} />} />
        </Route>
        <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>;
}
