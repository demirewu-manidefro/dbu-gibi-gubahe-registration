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

// @route   DELETE api/notifications/:id
// @desc    Dismiss notification (hide from user)
// @access  Private
router.delete('/:id', auth, notificationController.dismissNotification);

// @route   POST api/notifications
// @desc    Send a notification/message
// @access  Private
router.post('/', auth, notificationController.sendNotification);

module.exports = router;
