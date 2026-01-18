const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from request headers
 */
const verifyToken = (req, res, next) => {
    // Get token from header (format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        // Verify token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info from payload to request object
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or Expired Token' });
    }
};

module.exports = verifyToken;
