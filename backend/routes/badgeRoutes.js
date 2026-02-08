const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
router.get('/', async (req, res) => {
    try {
        const badges = await Badge.find({});
        res.json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get badge by ID
// @route   GET /api/badges/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const badge = await Badge.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        res.json(badge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
