import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';

const app = createApp(config);

async function startServer() {
    try {
        await connectDatabase(config.mongoUri);
        app.listen(config.port, () => console.log(`API running on http://localhost:${config.port}`));
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
