import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authenticate, clearSession } from '../services/auth';

const savedToken = localStorage.getItem('token');
const savedRole = localStorage.getItem('auth_role');

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const result = await authenticate(credentials);
        localStorage.setItem('admin_token', result.token);
        const role = result.user?.role || 'user';
        localStorage.setItem('auth_role', role);
        return { token: result.token, role, user: result.user };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (credentials, { rejectWithValue }) => {
    try {
        const result = await authenticate({ ...credentials, mode: 'register' });
        clearSession();
        return result.user;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: savedToken, role: savedRole || 'user', user: null, status: 'idle', error: '' },
    reducers: {
        signOut(state) {
            clearSession();
            state.token = null;
            state.role = 'user';
            state.user = null;
            state.status = 'idle';
            state.error = '';
        },
        clearAuthError(state) { state.error = ''; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = ''; })
            .addCase(loginUser.fulfilled, (state, action) => { state.status = 'succeeded'; state.token = action.payload.token; state.role = action.payload.role; state.user = action.payload.user; })
            .addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || 'Unable to sign in'; })
            .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = ''; })
            .addCase(registerUser.fulfilled, (state) => { state.status = 'succeeded'; state.token = null; state.role = 'user'; state.user = null; })
            .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || 'Unable to create account'; });
    },
});

export const { signOut, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
