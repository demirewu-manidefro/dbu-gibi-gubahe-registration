const express = require('express');
const router = express.Router();
const { resetPassword, changePassword } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   PUT /api/users/reset-password/:studentId
// @desc    Reset student password to default (admin/manager only)
// @access  Private
router.put('/reset-password/:studentId', auth, resetPassword);

// @route   PUT /api/users/change-password
// @desc    Change own password
// @access  Private
router.put('/change-password', auth, changePassword);

module.exports = router;
