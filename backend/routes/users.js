const express = require('express');
const router = express.Router();
const { resetPassword, changePassword, getAdmins, registerAdmin, toggleAdminStatus, updateProfile, updateAdmin, makeStudentAdmin } = require('../controllers/userController');
const { auth } = require('../middleware/auth');


router.put('/reset-password/:studentId', auth, resetPassword);


router.put('/change-password', auth, changePassword);


router.get('/admins', auth, getAdmins);


router.post('/admins', auth, registerAdmin);


router.put('/admins/:id', auth, updateAdmin);


router.put('/admins/:id/status', auth, toggleAdminStatus);


router.put('/profile', auth, updateProfile);

router.put('/make-admin/:studentId', auth, makeStudentAdmin);

module.exports = router;
