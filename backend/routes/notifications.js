const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');


router.get('/', auth, notificationController.getNotifications);


router.put('/:id/read', auth, notificationController.markAsRead);


router.delete('/:id', auth, notificationController.dismissNotification);


router.post('/', auth, notificationController.sendNotification);

module.exports = router;
