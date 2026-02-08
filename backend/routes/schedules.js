const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');

const SCHEDULE_FILE = path.join(__dirname, '../data/schedule.json');

// Helper to ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}

const readSchedule = () => {
    try {
        if (!fs.existsSync(SCHEDULE_FILE)) return { items: [], createdAt: null };
        const data = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));

        // Auto-delete if older than 1 week (7 days)
        if (data.createdAt) {
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - new Date(data.createdAt).getTime() > oneWeek) {
                fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({ items: [], createdAt: null }));
                return { items: [], createdAt: null };
            }
        }
        return data;
    } catch (err) {
        console.error('Error reading schedule file:', err);
        return { items: [], createdAt: null };
    }
};

const writeSchedule = (data) => {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2));
};

// @route   GET /api/schedules
// @desc    Get current schedule
router.get('/', async (req, res) => {
    const data = readSchedule();
    res.json(data.items || []);
});

// @route   POST /api/schedules
// @desc    Update the entire schedule (replace)
router.post('/', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    // Only Batch Admins or Managers can post
    if (req.user.role === 'admin' && req.user.section !== 'ባች') {
        return res.status(403).json({ message: 'ብቻ የባች አስተዳዳሪዎች መርሐ ግብር መለጠፍ ይችላሉ' });
    }

    const { day, time_range, activity, description } = req.body;

    const current = readSchedule();
    const newItem = {
        id: Date.now(),
        day,
        time_range,
        activity,
        description,
        created_by: req.user.name
    };

    current.items = [...(current.items || []), newItem];
    if (!current.createdAt) current.createdAt = new Date().toISOString();

    writeSchedule(current);
    res.json(newItem);
});

// @route   DELETE /api/schedules/:id
router.delete('/:id', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    // Only Batch Admins or Managers can delete
    if (req.user.role === 'admin' && req.user.section !== 'ባች') {
        return res.status(403).json({ message: 'ብቻ የባች አስተዳዳሪዎች መርሐ ግብር መሰረዝ ይችላሉ' });
    }

    const current = readSchedule();
    current.items = (current.items || []).filter(item => item.id.toString() !== req.params.id.toString());
    writeSchedule(current);
    res.json({ message: 'Schedule item removed' });
});

// @route   DELETE /api/schedules (Clear all)
router.delete('/', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    // Only Batch Admins or Managers can clear all
    if (req.user.role === 'admin' && req.user.section !== 'ባች') {
        return res.status(403).json({ message: 'ብቻ የባች አስተዳዳሪዎች መርሐ ግብር ማጽዳት ይችላሉ' });
    }

    writeSchedule({ items: [], createdAt: null });
    res.json({ message: 'All schedules cleared' });
});

module.exports = router;
