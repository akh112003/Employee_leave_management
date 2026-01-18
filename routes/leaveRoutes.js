const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

// 1. Apply for leave (All authenticated users)
router.post('/apply', verifyToken, leaveController.applyLeave);

// 2. View personal leave history (All authenticated users)
router.get('/my-history', verifyToken, leaveController.getMyLeaves);

// 3. Approve or Reject leave (Manager or Admin only)
router.patch('/:id/status', verifyToken, authorize(['MANAGER', 'ADMIN']), leaveController.updateLeaveStatus);

// 4. View all leaves (Admin only)
router.get('/all', verifyToken, authorize(['ADMIN']), leaveController.getAllLeaves);

module.exports = router;
