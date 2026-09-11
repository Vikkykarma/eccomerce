import { useState } from 'react';
import { createProductWithPhotos } from '../services/adminProducts';

const initialForm = { name: '', category: '', description: '', price: '', stock: '0' };

export default function ProductForm({ token, onClose, onCreated }) {
    const [form, setForm] = useState(initialForm);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    function handleChange(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    function handlePhotos(event) {
        setPhotos(Array.from(event.target.files || []));
        setError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        if (photos.length < 1) {
            setError('Select at least one product photo.');
            return;
        }
        if (photos.length > 8) {
            setError('Select no more than 8 product photos.');
            return;
        }
        setIsSaving(true);
        try {
            await createProductWithPhotos(token, form, photos);
            onCreated();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    }

    return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="product-form" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <div className="product-form-header"><div><p className="eyebrow">Inventory</p><h2 id="add-product-title">Add product</h2></div><button type="button" className="modal-close" aria-label="Close add product form" onClick={onClose}>×</button></div>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <label>Product name<input name="name" value={form.name} onChange={handleChange} required /></label>
                    <label>Category<input name="category" value={form.category} onChange={handleChange} required /></label>
                    <label>Description<textarea name="description" value={form.description} onChange={handleChange} rows="3" /></label>
                    <div className="form-row"><label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required /></label><label>Stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required /></label></div>
                    <label>Product photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} required /><small>{photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} selected` : 'Choose 1 to 8 JPEG, PNG, or WebP images.'}</small></label>
                </div>
                {error && <p className="login-error" role="alert">{error}</p>}
                <div className="product-form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving product...' : 'Save product'}</button></div>
            </form>
        </section>
    </div>;
}
