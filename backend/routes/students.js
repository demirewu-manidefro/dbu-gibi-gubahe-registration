const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, authorize, softAuth } = require('../middleware/auth');


router.get('/', [auth, authorize(['admin', 'manager'])], studentController.getStudents);


router.post('/', softAuth, studentController.registerStudent);


router.post('/import', [auth, authorize(['admin', 'manager'])], studentController.importStudents);


router.put('/:id', [auth, authorize(['admin', 'manager'])], studentController.updateStudent);


router.delete('/:id', [auth, authorize(['admin', 'manager'])], studentController.deleteStudent);


router.post('/:id/approve', [auth, authorize(['admin', 'manager'])], studentController.approveStudent);


router.post('/:id/decline', [auth, authorize(['admin', 'manager'])], studentController.declineStudent);

module.exports = router;
