import jwt from 'jsonwebtoken';

function readToken(request) {
    const authorization = request.headers.authorization;
    return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
}

export function requireAdmin(secret) {
    return (request, response, next) => {
        const token = readToken(request);
        if (!token) return response.status(401).json({ error: 'Authentication required' });
        try {
            const account = jwt.verify(token, secret);
            if (account.role !== 'admin') return response.status(403).json({ error: 'Admin access required' });
            request.admin = account;
            return next();
        } catch {
            return response.status(401).json({ error: 'Invalid or expired token' });
        }
    };
}

export function requireUser(secret) {
    return (request, response, next) => {
        const token = readToken(request);
        if (!token) return response.status(401).json({ error: 'Authentication required' });
        try {
            const account = jwt.verify(token, secret);
            if (account.role !== 'user') return response.status(403).json({ error: 'Customer access required' });
            request.user = account;
            return next();
        } catch {
            return response.status(401).json({ error: 'Invalid or expired token' });
        }
    };
}
