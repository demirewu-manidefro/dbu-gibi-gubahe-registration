const express = require('express');
const router = express.Router();
const { resetPassword, changePassword, getAdmins, registerAdmin, toggleAdminStatus, updateProfile, updateAdmin, makeStudentAdmin } = require('../controllers/userController');
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

// @route   PUT /api/users/admins/:id
// @desc    Update admin details (manager only)
// @access  Private
router.put('/admins/:id', auth, updateAdmin);

// @route   PUT /api/users/admins/:id/status
// @desc    Toggle admin status
// @access  Private
router.put('/admins/:id/status', auth, toggleAdminStatus);

// @route   PUT /api/users/profile
// @desc    Update own profile (name, photo)
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT /api/users/make-admin/:studentId
// @desc    Promote student to admin (manager only)
// @access  Private
router.put('/make-admin/:studentId', auth, makeStudentAdmin);

module.exports = router;
