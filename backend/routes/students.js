const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, authorize, softAuth } = require('../middleware/auth');

// @route   GET api/students
// @desc    Get all students
// @access  Private (Admin/Manager)
router.get('/', [auth, authorize(['admin', 'manager'])], studentController.getStudents);

// @route   POST api/students
// @desc    Register a student (Public for Sign-up, or Admin-led)
// @access  Public (Optional Auth)
router.post('/', softAuth, studentController.registerStudent);

// @route   POST api/students/import
// @desc    Bulk import students
// @access  Private (Admin/Manager)
router.post('/import', [auth, authorize(['admin', 'manager'])], studentController.importStudents);

// @route   PUT api/students/:id
// @desc    Update a student
// @access  Private (Admin/Manager)
router.put('/:id', [auth, authorize(['admin', 'manager'])], studentController.updateStudent);

// @route   DELETE api/students/:id
// @desc    Delete a student
// @access  Private (Admin/Manager)
router.delete('/:id', [auth, authorize(['admin', 'manager'])], studentController.deleteStudent);

// @route   POST api/students/:id/approve
// @desc    Approve a student registration
// @access  Private (Admin/Manager)
router.post('/:id/approve', [auth, authorize(['admin', 'manager'])], studentController.approveStudent);

// @route   POST api/students/:id/decline
// @desc    Decline a student registration
// @access  Private (Admin/Manager)
router.post('/:id/decline', [auth, authorize(['admin', 'manager'])], studentController.declineStudent);

module.exports = router;
