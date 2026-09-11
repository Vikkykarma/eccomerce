export function errorHandler(error, _request, response, _next) {
    console.error(error);

    if (error.name === 'MulterError') {
        return response.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller' : error.message });
    }

    if (error.message === 'Only JPEG, PNG, and WebP images are allowed') {
        return response.status(400).json({ error: error.message });
    }

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'Invalid request data', details: Object.values(error.errors).map((item) => item.message) });
    }

    if (error.code === 11000) {
        return response.status(409).json({ error: 'A record with this value already exists' });
    }

    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'Invalid resource id' });
    }

    return response.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' });
}
