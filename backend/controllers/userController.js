const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

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
