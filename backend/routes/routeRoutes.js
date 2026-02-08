const express = require('express');
const router = express.Router();
const {
    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute
} = require('../controllers/routeController');
const { protect, adminOrCityPlanner } = require('../middleware/authMiddleware');


router.get('/', getRoutes);
router.post('/', protect, adminOrCityPlanner, createRoute);

router.get('/:id', getRouteById);

router.put('/:id', protect, adminOrCityPlanner, updateRoute);

// Test PUT route WITHOUT custom middleware to see if it works
router.put('/simple-put/:id', (req, res) => {
    console.log('[ROUTER] SIMPLE PUT HIT:', req.params.id);
    res.json({ message: 'Simple PUT works', id: req.params.id });
});

router.delete('/:id', protect, adminOrCityPlanner, deleteRoute);

// Test route to verify ID path is working
router.get('/test/:id', (req, res) => res.json({ id: req.params.id, message: 'Path works' }));

module.exports = router;
