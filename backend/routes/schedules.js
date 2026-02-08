const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { query } = require('../config/db');

// @route   GET api/schedules
// @desc    Get weekly schedule
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Auto-delete schedules older than 1 week
        await query("DELETE FROM schedules WHERE created_at < NOW() - INTERVAL '7 days'");

        const { rows } = await query('SELECT * FROM schedules ORDER BY created_at DESC LIMIT 1');

        if (rows.length === 0) {
            return res.json({ items: [], createdAt: null });
        }

        res.json({
            items: rows[0].items,
            createdAt: rows[0].created_at
        });
    } catch (err) {
        console.error('Fetch schedule error:', err);
        res.status(500).json({ message: 'መርሐ ግብር ማግኘት አልተቻለም' });
    }
});

// @route   POST api/schedules
// @desc    Add/Update schedule item
// @access  Batch Admin & Manager
router.post('/', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    // Extra security: Only 'ባች' admin or manager
    if (req.user.role === 'admin' && !(req.user.section === 'bach' || req.user.username === 'bach')) {
        return res.status(403).json({ message: 'ብቻ የbach አስተዳዳሪዎች መርሐ ግብር መለጠፍ ይችላሉ' });
    }

    const { activity, day, time_range, description } = req.body;
    if (!activity || !day || !time_range) {
        return res.status(400).json({ message: 'እባክዎ ሁሉንም መስኮች ያሟሉ' });
    }

    try {
        // Get current schedule items
        const { rows } = await query('SELECT * FROM schedules ORDER BY created_at DESC LIMIT 1');
        let currentItems = rows.length > 0 ? rows[0].items : [];

        const newItem = {
            id: Date.now(),
            activity,
            day,
            time_range,
            description,
            addedBy: req.user.name || req.user.username
        };

        currentItems.push(newItem);

        // Delete old and insert new (or just update the latest)
        // For simplicity and to match "session" feel, we keep one main row or append
        await query('DELETE FROM schedules');
        await query('INSERT INTO schedules (items) VALUES ($1)', [JSON.stringify(currentItems)]);

        res.json(newItem);
    } catch (err) {
        console.error('Update schedule error:', err);
        res.status(500).json({ message: 'መርሐ ግብር ማስቀመጥ አልተቻለም' });
    }
});

// @route   DELETE api/schedules
// @desc    Clear all schedules
// @access  Batch Admin & Manager
router.delete('/', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    if (req.user.role === 'admin' && !(req.user.section === 'bach' || req.user.username === 'bach')) {
        return res.status(403).json({ message: 'ብቻ የbach አስተዳዳሪዎች መርሐ ግብር ማጽዳት ይችላሉ' });
    }

    try {
        await query('DELETE FROM schedules');
        res.json({ message: 'መርሐ ግብር በተሳካ ሁኔታ ጸድቷል' });
    } catch (err) {
        console.error('Clear schedule error:', err);
        res.status(500).json({ message: 'መርሐ ግብር ማጽዳት አልተቻለም' });
    }
});

// @route   DELETE api/schedules/:id
// @desc    Delete single schedule item
// @access  Batch Admin & Manager
router.delete('/:id', [auth, authorize(['admin', 'manager'])], async (req, res) => {
    if (req.user.role === 'admin' && !(req.user.section === 'bach' || req.user.username === 'bach')) {
        return res.status(403).json({ message: 'ብቻ የbach አስተዳዳሪዎች መርሐ ግብር ማጽዳት ይችላሉ' });
    }

    try {
        const { rows } = await query('SELECT * FROM schedules ORDER BY created_at DESC LIMIT 1');
        if (rows.length === 0) return res.status(404).json({ message: 'መርሐ ግብር አልተገኘም' });

        const updatedItems = rows[0].items.filter(item => item.id.toString() !== req.params.id);

        await query('DELETE FROM schedules');
        await query('INSERT INTO schedules (items) VALUES ($1)', [JSON.stringify(updatedItems)]);

        res.json({ message: 'ተሰርዟል' });
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(500).json({ message: 'መሰረዝ አልተቻለም' });
    }
});

module.exports = router;
