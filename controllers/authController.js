const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Handle User Registration
 */
exports.register = async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Get role_id
    const assignedRole = role || 'Employee';
    const [roles] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [assignedRole]);
    if (roles.length === 0) {
        return res.status(400).json({ message: 'Invalid role provided' });
    }
    const roleId = roles[0].role_id;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save User
    const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword, roleId]
    );

    res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId,
        role: assignedRole
    });
};

/**
 * Handle User Login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include role name
        const [users] = await db.query(
            `SELECT u.*, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const payload = {
            id: user.user_id,
            email: user.email,
            role: user.role_name.toUpperCase()
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token: `Bearer ${token}`,
            role: payload.role
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get User Profile (Protected)
 */
exports.getProfile = async (req, res) => {
    const [users] = await db.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [req.user.id]
    );

    if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        message: 'Auth success: Profile data accessed',
        user: users[0]
    });
};
