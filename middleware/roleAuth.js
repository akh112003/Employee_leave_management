/**
 * Middleware to restrict access based on user roles.
 * Must be used AFTER the verifyToken middleware.
 * 
 * @param {Array} allowedRoles - List of roles permitted to access the route
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized: No role information found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: You do not have the required permissions (${allowedRoles.join(' or ')})`
            });
        }

        next();
    };
};

module.exports = authorize;
