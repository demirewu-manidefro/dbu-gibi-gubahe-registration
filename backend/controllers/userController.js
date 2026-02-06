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

exports.getAdmins = async (req, res) => {
    try {
        const { rows } = await query(
            "SELECT id, username, name, role, section, status, photo_url, last_activity as \"lastActivity\" FROM users WHERE role IN ('admin', 'manager') ORDER BY id ASC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.registerAdmin = async (req, res) => {
    const { username, password, name, section, photo_url, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await query(
            "INSERT INTO users (username, password, name, role, section, status, photo_url) VALUES ($1, $2, $3, $4, $5, 'active', $6) RETURNING id, username, name, role, section, status, photo_url",
            [username, hashedPassword, name, role || 'admin', section, photo_url]
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
exports.updateProfile = async (req, res) => {
    const { name, photo_url } = req.body;
    try {
        const { rows } = await query(
            "UPDATE users SET name = COALESCE($1, name), photo_url = COALESCE($2, photo_url) WHERE id = $3 RETURNING id, username, name, role, section, status, photo_url",
            [name, photo_url, req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, section, photo_url, password, role } = req.body;
    try {
        let updateQuery = "UPDATE users SET name = COALESCE($1, name), section = COALESCE($2, section), photo_url = COALESCE($3, photo_url), role = COALESCE($4, role)";
        let queryParams = [name, section, photo_url, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ", password = $" + (queryParams.length + 1);
            queryParams.push(hashedPassword);
        }

        updateQuery += " WHERE id = $" + (queryParams.length + 1) + " RETURNING id, username, name, role, section, status, photo_url";
        queryParams.push(id);

        const { rows } = await query(updateQuery, queryParams);

        if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.makeStudentAdmin = async (req, res) => {
    const { studentId } = req.params;

    // Only Manager or maybe Admin can do this? Let's restrict to Manager as they manage Admins
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only the Manager can promote students to Admin' });
    }

    try {
        // Find the user_id associated with the student
        const { rows: studentRows } = await query('SELECT user_id, full_name, service_section FROM students WHERE id = $1', [studentId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { user_id, full_name, service_section } = studentRows[0];

        if (!user_id) {
            return res.status(400).json({ message: 'No user account found for this student' });
        }

        const { rows: userRows } = await query('SELECT username FROM users WHERE id = $1', [user_id]);
        const dbUsername = userRows[0].username;

        // Use full_name if available and not a placeholder, otherwise use username
        const displayName = (full_name && full_name !== 'N/A' && full_name !== 'Unknown Student' && full_name !== 'New Student')
            ? full_name
            : dbUsername;

        const section = service_section || 'እቅድ';

        const { rows: userUpdate } = await query(
            "UPDATE users SET role = 'admin', name = $1, section = $2 WHERE id = $3 RETURNING username",
            [displayName, section, user_id]
        );

        await createNotification(
            'admin_created',
            `Student Promoted to Admin: ${displayName} (${section})`,
            'manager'
        );

        // Delete the student record now that they are an admin
        await query('DELETE FROM students WHERE id = $1', [studentId]);

        res.json({ message: `Student ${displayName} promoted to Admin successfully and removed from student list`, username: userUpdate[0].username });

    } catch (err) {
        console.error('Make admin error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.makeSuperManager = async (req, res) => {
    const { studentId } = req.params;

    // Only current Managers can promote others to Manager
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only a Super Manager can promote others to Super Manager' });
    }

    try {
        // Find the user_id associated with the student
        const { rows: studentRows } = await query('SELECT user_id, full_name FROM students WHERE id = $1', [studentId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { user_id, full_name } = studentRows[0];

        if (!user_id) {
            return res.status(400).json({ message: 'No user account found for this student' });
        }

        const { rows: userRows } = await query('SELECT username FROM users WHERE id = $1', [user_id]);
        const dbUsername = userRows[0].username;

        // Use full_name if available and not a placeholder, otherwise use username
        const displayName = (full_name && full_name !== 'N/A' && full_name !== 'Unknown Student' && full_name !== 'New Student')
            ? full_name
            : dbUsername;

        const { rows: userUpdate } = await query(
            "UPDATE users SET role = 'manager', name = $2, section = 'ሁሉም' WHERE id = $1 RETURNING username",
            [user_id, displayName]
        );

        await createNotification(
            'system',
            `User Promoted to Super Manager: ${displayName}`,
            'manager'
        );

        // Delete the student record now that they are a manager
        await query('DELETE FROM students WHERE id = $1', [studentId]);

        res.json({ message: `User ${displayName} promoted to Super Manager successfully and removed from student list`, username: userUpdate[0].username });

    } catch (err) {
        console.error('Make super manager error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.demoteToStudent = async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only the Manager can demote users' });
    }

    try {
        const { rows: users } = await query("SELECT username, name, role FROM users WHERE id = $1", [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const userToDemote = users[0];

        // Check if the user is a manager and if they are the only one
        if (userToDemote.role === 'manager') {
            const { rows: managerCount } = await query("SELECT COUNT(*) FROM users WHERE role = 'manager'");
            const count = parseInt(managerCount[0].count);

            if (count <= 1) {
                return res.status(400).json({ message: 'Cannot demote the last Super Manager. Please promote another user to Manager first.' });
            }
        }

        // Update role to 'student'
        // We set section to NULL as students don't usually manage sections
        await query(
            "UPDATE users SET role = 'student', section = NULL WHERE id = $1",
            [id]
        );

        await createNotification(
            'system',
            `User demoted to Student: ${userToDemote.name}`,
            'manager'
        );

        res.json({ message: `User ${userToDemote.name} demoted to student successfully` });
    } catch (err) {
        console.error('Demote error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
