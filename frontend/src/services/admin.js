const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

export async function fetchDashboard(token) {
    const response = await fetch(`${apiUrl}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load dashboard');
    return result;
}
