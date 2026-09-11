import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuthError, loginUser, registerUser } from '../store/authSlice';

export default function AuthScreen({ mode: initialMode = 'login' }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, status } = useSelector((state) => state.auth);
    const [mode, setMode] = useState(initialMode);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const request = mode === 'register' ? registerUser({ name, email, password }) : loginUser({ mode, email, password });
            const result = await dispatch(request).unwrap();
            if (mode === 'register') navigate('/login');
            else navigate(result.role === 'admin' ? '/admin' : '/shop');
        } catch {
            // Redux stores the server error for the form to display.
        }
    }

    return <main className="login-page min-h-screen px-4 py-8 sm:px-6"><section className="login-card w-full max-w-md space-y-1">
        <div className="login-brand"><span className="brand-mark">n</span><strong>northand</strong></div>
        <p className="login-kicker">North & Co. account</p>
        <h1>{mode === 'register' ? 'Create your account' : 'Sign in to your account'}</h1>
        <p className="login-copy">Save your details and keep track of every order.</p>
        <form className="mt-5 space-y-1" onSubmit={handleSubmit}>
            {mode === 'register' && <><label htmlFor="user-name">Full name</label><input className="h-11" id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></>}
            <label htmlFor="auth-email">Email</label><input className="h-11" id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
            <label htmlFor="auth-password">Password</label><input className="h-11" id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? <><span>New here?</span> <Link to="/register" onClick={() => { setMode('register'); dispatch(clearAuthError()); }}>Create an account</Link></> : <><span>Already have an account?</span> <Link to="/login" onClick={() => { setMode('login'); dispatch(clearAuthError()); }}>Sign in</Link></>}</p>
        <small className="login-note">Your account data stays protected.</small>
    </section></main>;
}
