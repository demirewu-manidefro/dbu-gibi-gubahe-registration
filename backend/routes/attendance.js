const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET api/attendance
// @desc    Get attendance history
// @access  Private
router.get('/', auth, attendanceController.getAttendanceHistory);

// @route   POST api/attendance
// @desc    Save batch attendance records
// @access  Private (Admin/Manager)
router.post('/', [auth, authorize(['admin', 'manager'])], attendanceController.saveAttendanceBatch);

// @route   GET api/attendance/analytics
// @desc    Get analytics stats
// @access  Private
router.get('/analytics', auth, attendanceController.getAnalyticsStats);

module.exports = router;
