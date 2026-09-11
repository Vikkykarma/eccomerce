import cors from 'cors';
import express from 'express';
import { createAuthRouter, createUserRouter } from './routes/auth.js';
import { createAdminRouter } from './routes/admin.js';
import { createStoreRouter } from './routes/store.js';
import { createPaymentRouter } from './routes/payments.js';
import { requireAdmin, requireUser } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { configureCloudinary } from './config/cloudinary.js';

export function createApp(config) {
    const app = express();
    app.use(cors({ origin: config.frontendOrigin }));
    app.use(express.json());
    app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'admin-api' }));
    app.use('/api/auth', createAuthRouter(config, requireAdmin(config.jwtSecret)));
    app.use('/api/users', createUserRouter(config, requireUser(config.jwtSecret)));
    app.use('/api/store', createStoreRouter());
    app.use('/api/payments', createPaymentRouter(config, requireUser(config.jwtSecret)));
    app.use('/api', createAdminRouter(requireAdmin(config.jwtSecret), configureCloudinary(config)));
    app.use((_request, response) => response.status(404).json({ error: 'Route not found' }));
    app.use(errorHandler);
    return app;
}
