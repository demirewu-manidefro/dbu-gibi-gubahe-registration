const { query } = require('../config/db');
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
    res.json([]);
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await query("DELETE FROM notifications WHERE id = $1", [id]);

        res.json({ success: true, message: 'Notification deleted (marked as read)' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.dismissNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.user;

        const check = await query("SELECT dismissed_by FROM notifications WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ msg: 'Notification not found' });

        let dismissedBy = check.rows[0].dismissed_by || [];
        if (!dismissedBy.includes(username)) {
            dismissedBy.push(username);
            await query("UPDATE notifications SET dismissed_by = $1 WHERE id = $2", [JSON.stringify(dismissedBy), id]);
        }

        res.json({ success: true, message: 'Notification dismissed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { type, message, target } = req.body;
        const from = req.user.username;

        await query(
            "INSERT INTO notifications (type, message, target_section, from_username) VALUES ($1, $2, $3, $4)",
            [type || 'message', message, target || 'all', from]
        );

        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error sending notification:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
