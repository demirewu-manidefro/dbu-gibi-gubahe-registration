const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { createNotification } = require('./notificationController');

exports.resetPassword = async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find the user by student ID
        const { rows: studentRows } = await query('SELECT user_id FROM students WHERE id = $1', [studentId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const userId = studentRows[0].user_id;

        if (!userId) {
            return res.status(400).json({ message: 'No user account associated with this student' });
        }

        // Hash the default password "1234"
        const defaultPassword = await bcrypt.hash('1234', 10);

        // Update the user's password and set must_change_password flag
        await query(
            'UPDATE users SET password = $1, must_change_password = TRUE WHERE id = $2',
            [defaultPassword, userId]
        );

        res.json({ message: 'Password reset to default (1234). User must change password on next login.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server Error', details: err.message });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Get current user
        const { rows } = await query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear must_change_password flag
        await query(
            'UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server Error', details: err.message });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const { rows } = await query(
            "SELECT id, username, name, role, section, status, last_activity as \"lastActivity\" FROM users WHERE role IN ('admin', 'manager') ORDER BY id ASC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.registerAdmin = async (req, res) => {
    const { username, password, name, section } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await query(
            "INSERT INTO users (username, password, name, role, section, status) VALUES ($1, $2, $3, 'admin', $4, 'active') RETURNING id, username, name, role, section, status",
            [username, hashedPassword, name, section]
        );

        await createNotification(
            'admin_created',
            `New Admin Created: ${name} (${section})`,
            'manager'
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.toggleAdminStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: users } = await query("SELECT status, name FROM users WHERE id = $1", [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const newStatus = users[0].status === 'active' ? 'blocked' : 'active';
        const { rows } = await query(
            "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, status",
            [newStatus, id]
        );

        await createNotification(
            'system',
            `Admin ${users[0].name} ${newStatus === 'active' ? 'unblocked' : 'blocked'}`,
            'manager'
        );

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
