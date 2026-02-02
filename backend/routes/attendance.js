const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, attendanceController.getAttendanceHistory);


router.post('/', [auth, authorize(['admin', 'manager'])], attendanceController.saveAttendanceBatch);


router.get('/analytics', auth, attendanceController.getAnalyticsStats);

module.exports = router;
