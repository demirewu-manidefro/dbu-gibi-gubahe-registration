const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middleware/auth');


router.get('/', auth, activityController.getLogs);


router.post('/', auth, activityController.addLog);

module.exports = router;
