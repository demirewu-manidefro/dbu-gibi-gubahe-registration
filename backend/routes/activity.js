const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

// @route   GET api/activity
// @desc    Get recent activities
// @access  Private
router.get('/', auth, activityController.getLogs);

// @route   POST api/activity
// @desc    Add an activity log
// @access  Private
router.post('/', auth, activityController.addLog);

module.exports = router;
