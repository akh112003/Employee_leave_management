const db = require('../config/db');

/**
 * Employee applies for leave
 * POST /api/leaves/apply
 */
exports.applyLeave = async (req, res) => {
    const { typeId, startDate, endDate, reason } = req.body;

    if (!typeId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Type ID, Start Date, and End Date are required' });
    }

    // Calculate total days (simple difference)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
        return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Save to Database
    const [result] = await db.query(
        'INSERT INTO leave_requests (user_id, type_id, start_date, end_date, total_days, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, typeId, startDate, endDate, totalDays, reason, 'Pending']
    );

    res.status(201).json({
        message: 'Leave application submitted successfully',
        requestId: result.insertId,
        totalDays
    });
};

/**
 * Manager/Admin approves or rejects leave
 * PATCH /api/leaves/:id/status
 */
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status, comments } = req.body;

    const validStatuses = ['Approved', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Approved, Rejected, or Cancelled' });
    }

    // Check if request exists
    const [requests] = await db.query('SELECT * FROM leave_requests WHERE request_id = ?', [id]);
    if (requests.length === 0) {
        return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update status
    await db.query(
        'UPDATE leave_requests SET status = ?, manager_id = ?, comments = ? WHERE request_id = ?',
        [status, req.user.id, comments, id]
    );

    res.json({
        message: `Leave request ${status.toLowerCase()} successfully`,
        requestId: id,
        status
    });
};

/**
 * Employee views own leave history
 * GET /api/leaves/my-history
 */
exports.getMyLeaves = async (req, res) => {
    const [leaves] = await db.query(
        `SELECT lr.*, lt.type_name 
         FROM leave_requests lr 
         JOIN leave_types lt ON lr.type_id = lt.type_id 
         WHERE lr.user_id = ? 
         ORDER BY lr.created_at DESC`,
        [req.user.id]
    );

    res.json({
        count: leaves.length,
        leaves
    });
};

/**
 * Admin views all leaves
 * GET /api/leaves/all
 */
exports.getAllLeaves = async (req, res) => {
    const [leaves] = await db.query(
        `SELECT lr.*, lt.type_name, u.first_name, u.last_name, u.email 
         FROM leave_requests lr 
         JOIN leave_types lt ON lr.type_id = lt.type_id 
         JOIN users u ON lr.user_id = u.user_id 
         ORDER BY lr.created_at DESC`
    );

    res.json({
        count: leaves.length,
        allLeaves: leaves
    });
};
