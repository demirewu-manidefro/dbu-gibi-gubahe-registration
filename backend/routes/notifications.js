const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get all notifications for the user
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
