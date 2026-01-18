/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('🔥 Error:', err.stack);

    // Default status code and message
    let statusCode = req.statusCode === 200 ? 500 : req.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific JWT/Auth errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Only include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
