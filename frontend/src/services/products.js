const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function fetchProducts({ page = 1, limit = 6, search = '' } = {}) {
    const query = new URLSearchParams({ page, limit });
    if (search.trim()) query.set('search', search.trim());
    const response = await fetch(`${apiUrl}/api/store/products?${query}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load products');
    return result;
}
