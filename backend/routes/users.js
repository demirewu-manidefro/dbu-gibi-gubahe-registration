const express = require('express');
const router = express.Router();
const { resetPassword, changePassword, getAdmins, registerAdmin, toggleAdminStatus } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   PUT /api/users/reset-password/:studentId
// @desc    Reset student password to default (admin/manager only)
// @access  Private
router.put('/reset-password/:studentId', auth, resetPassword);

// @route   PUT /api/users/change-password
// @desc    Change own password
// @access  Private
router.put('/change-password', auth, changePassword);

// @route   GET /api/users/admins
// @desc    Get all admin users
// @access  Private
router.get('/admins', auth, getAdmins);

// @route   POST /api/users/admins
// @desc    Register a new admin
// @access  Private
router.post('/admins', auth, registerAdmin);

// @route   PUT /api/users/admins/:id/status
// @desc    Toggle admin status
// @access  Private
router.put('/admins/:id/status', auth, toggleAdminStatus);

module.exports = router;
