const jwt = require('jsonwebtoken');

function verifyToken(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied, token missing' });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) return res.status(401).json({ error: 'Access denied' });

        try {
            const decoded = jwt.verify(token, 'secret');
            req.userId = decoded.userId;
            req.role = decoded.role;

            if (!req.role || (requiredRole && req.role !== requiredRole)) {
                return res.status(403).json({ error: 'Access denied, insufficient permissions' });
            }

            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
}

module.exports = verifyToken;