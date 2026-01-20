require('dotenv').config();
const express = require('express');
const path = require('path'); // Import path module
const cors = require('cors'); // Good practice for modern APIs

// Config
const db = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Standard Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Allow cross-origin requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files with absolute path

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/leaves', leaveRoutes);

// --- Basic Home Service Info ---
app.get('/api/health', (req, res) => {
    res.json({
        service: 'Employee Leave Management API',
        version: '1.0.0',
        status: 'Online'
    });
});

// --- 404 Handler ---
app.use((req, res, next) => {
    res.status(404);
    throw new Error('Endpoint not found');
});

// --- Global Error Handler (Must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;

// --- Global Crash Handlers ---
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1); // Nodemon will restart
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1); // Nodemon will restart
});
