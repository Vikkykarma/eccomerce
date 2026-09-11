const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

export async function authenticate({ mode, name, email, password }) {
    const body = mode === 'register' ? { name, email, password } : { email, password };
    const endpoints = mode === 'register' ? ['/api/users/register'] : ['/api/auth/login', '/api/users/login'];
    let lastError = 'Unable to sign in';

    for (const endpoint of endpoints) {
        const response = await fetch(`${apiUrl}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        if (response.ok) return result;
        lastError = result.error || lastError;
    }

    throw new Error(lastError);
}

export function clearSession() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('auth_role');

}
