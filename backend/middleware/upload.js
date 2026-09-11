import multer from 'multer';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const productPhotos = multer({
    storage: multer.memoryStorage(),
    limits: { files: 8, fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) return callback(new Error('Only JPEG, PNG, and WebP images are allowed'));
        return callback(null, true);
    },
});
