import 'dotenv/config';

const required = ['PORT', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_ROLE', 'MONGODB_URI', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

export const config = {
    port: Number(process.env.PORT) || 4000,
    jwtSecret: process.env.JWT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    adminRole: process.env.ADMIN_ROLE,
    mongoUri: process.env.MONGODB_URI,
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'https://eccomerce-pi-five.vercel.app',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
