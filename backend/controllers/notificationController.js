const createNotification = async (type, message, targetSection) => {
    // No-op: Notification system disabled
    console.log(`[Disabled] Create notification skipped: ${type}`);
};

exports.createNotification = createNotification;

exports.getNotifications = async (req, res) => {
    res.json([]);
};

exports.markAsRead = async (req, res) => {
    res.json({ success: true, message: 'Notification disabled' });
};

exports.dismissNotification = async (req, res) => {
    res.json({ success: true, message: 'Notification disabled' });
};

exports.sendNotification = async (req, res) => {
    res.status(201).json({ success: true, message: 'Notification system disabled' });
};
