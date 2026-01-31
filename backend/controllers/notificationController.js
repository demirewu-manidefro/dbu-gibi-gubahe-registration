const { query } = require('../config/db');

// Helper function to create notification
const createNotification = async (type, message, targetSection) => {
    try {
        console.log(`Creating notification: Type=${type}, Message=${message}, Target=${targetSection}`);
        await query(
            "INSERT INTO notifications (type, message, target_section) VALUES ($1, $2, $3)",
            [type, message, targetSection]
        );
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};

exports.createNotification = createNotification;

exports.getNotifications = async (req, res) => {
    try {
        const { role, section, username } = req.user;
        let sql = "SELECT * FROM notifications WHERE";
        const params = [];

        // Logic for fetching notifications:
        // 1. Manager: sees EVERYTHING
        // 2. Admin: sees 'section' target, 'username' target, or 'all'
        // 3. User: sees 'username' target or 'all'

        if (role === 'manager') {
            // Manager sees EVERYTHING
            sql += " (1=1) ";
        } else if (role === 'admin') {
            sql += " (target_section = $1 OR target_section = $2 OR target_section = 'all') ";
            // params: [section, username]
            params.push(section, username);
        } else {
            // Regular user / Student
            sql += " (target_section = $1 OR target_section = 'all') ";
            params.push(username);
        }

        sql += " ORDER BY created_at DESC LIMIT 50";

        const { rows } = await query(sql, params);

        // Format for frontend
        const notifications = rows.map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            target: n.target_section,
            isRead: n.read_by.includes(username), // Computed for this user
            readBy: n.read_by || [],
            time: n.created_at,
            from: 'System' // Can be enhanced later
        }));

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.user;

        // Use JSONB operator to append username if not exists
        // Postgres: update notifications set read_by = read_by || '["username"]'
        // But better uniqueness check:
        // jsonb_set etc. Simple approach:

        // check if already read
        const check = await query("SELECT read_by FROM notifications WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ msg: 'Notification not found' });

        let readBy = check.rows[0].read_by || [];
        if (!readBy.includes(username)) {
            readBy.push(username);
            await query("UPDATE notifications SET read_by = $1 WHERE id = $2", [JSON.stringify(readBy), id]);
        }

        res.json(readBy);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
