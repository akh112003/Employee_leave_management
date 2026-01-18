const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

// Protected: Restricted to ADMIN only
router.get('/dashboard', verifyToken, authorize(['ADMIN']), (req, res) => {
    res.json({
        message: 'Welcome to the Admin Dashboard',
        access: 'ADMIN_ONLY',
        stats: { totalUsers: 150, pendingApprovals: 5 }
    });
});

// Protected: Restricted to ADMIN only (e.g., manage users)
router.get('/users', verifyToken, authorize(['ADMIN']), (req, res) => {
    res.json({
        message: 'Admin: List of all users',
        users: []
    });
});

module.exports = router;
