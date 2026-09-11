import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchProducts } from '../services/products';

export const loadProducts = createAsyncThunk('products/loadProducts', async (page = 1, { rejectWithValue }) => {
    try { return await fetchProducts({ page }); } catch (error) { return rejectWithValue(error.message); }
});

const productsSlice = createSlice({
    name: 'products',
    initialState: { items: [], pagination: { page: 1, pages: 1, total: 0 }, status: 'idle', error: '' },
    reducers: { clearProductError(state) { state.error = ''; } },
    extraReducers: (builder) => {
        builder
            .addCase(loadProducts.pending, (state) => { state.status = 'loading'; state.error = ''; })
            .addCase(loadProducts.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload.data; state.pagination = action.payload.pagination; })
            .addCase(loadProducts.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || 'Unable to load products'; });
    },
});

export const { clearProductError } = productsSlice.actions;
export default productsSlice.reducer;
