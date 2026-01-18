const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

// Protected: Restricted to MANAGER and ADMIN
router.get('/requests', verifyToken, authorize(['MANAGER', 'ADMIN']), (req, res) => {
    res.json({
        message: 'Manager/Admin: Viewing leave requests for your team',
        access: 'MANAGER_OR_ADMIN',
        requests: []
    });
});

// Protected: Manager only specific action
router.post('/approve-leave', verifyToken, authorize(['MANAGER']), (req, res) => {
    res.json({
        message: 'Manager: Leave request approved successfully'
    });
});

module.exports = router;
