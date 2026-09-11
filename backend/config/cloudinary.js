import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary(config) {
    cloudinary.config({
        cloud_name: config.cloudinaryCloudName,
        api_key: config.cloudinaryApiKey,
        api_secret: config.cloudinaryApiSecret,
    });
    return cloudinary;
}

export function uploadImage(cloudinaryClient, fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinaryClient.uploader.upload_stream({ folder: 'ecommerce/products', resource_type: 'image' }, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });
        stream.end(fileBuffer);
    });
}
