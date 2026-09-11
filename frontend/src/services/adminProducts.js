const apiUrl = process.env.REACT_APP_API_URL || 'https://eccomerce-mtbw.onrender.com';

export async function createProductWithPhotos(token, product, photos) {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('description', product.description || '');
    formData.append('price', product.price);
    formData.append('stock', product.stock || 0);
    photos.forEach((photo) => formData.append('photos', photo));

    const response = await fetch(`${apiUrl}/api/products/with-photos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to upload product photos');
    return result;
}