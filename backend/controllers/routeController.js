const Route = require('../models/Route');

// @desc    Create a new route
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res) => {
    console.log('Backend creating route with body:', req.body);
    try {
        const { name, distance, difficulty, polyline, safetyFeatures, safetyWarnings, originAddress, destinationAddress } = req.body;

        const route = await Route.create({
            name,
            distance,
            difficulty,
            polyline,
            safetyFeatures,
            safetyWarnings,
            originAddress,
            destinationAddress,
            createdBy: req.user._id
        });

        console.log('Route created successfully:', route._id);
        res.status(201).json(route);
    } catch (error) {
        console.error('Error in createRoute:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res) => {
    console.log(`Update request for route ID: ${req.params.id}`, req.body);
    try {
        const { name, distance, difficulty, polyline, safetyFeatures, safetyWarnings, isActive, originAddress, destinationAddress } = req.body;

        const route = await Route.findById(req.params.id);

        if (route) {
            route.name = name || route.name;
            route.distance = distance || route.distance;
            route.difficulty = difficulty || route.difficulty;
            route.polyline = polyline || route.polyline;
            route.safetyFeatures = safetyFeatures || route.safetyFeatures;
            route.safetyWarnings = safetyWarnings || route.safetyWarnings;
            route.isActive = isActive !== undefined ? isActive : route.isActive;
            route.originAddress = originAddress || route.originAddress;
            route.destinationAddress = destinationAddress || route.destinationAddress;

            const updatedRoute = await route.save();
            console.log('Route updated successfully:', updatedRoute._id);
            res.json(updatedRoute);
        } else {
            console.log('Route not found for update:', req.params.id);
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        console.error('Error in updateRoute:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res) => {
    try {
        const {
            difficulty,
            minDistance,
            maxDistance,
            minSafetyRating,
            safetyFeature,
            search
        } = req.query;

        const filter = { isActive: { $ne: false } };

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (minDistance || maxDistance) {
            filter.distance = {};
            if (minDistance) filter.distance.$gte = parseFloat(minDistance);
            if (maxDistance) filter.distance.$lte = parseFloat(maxDistance);
        }

        if (minSafetyRating) {
            filter.averageRating = { $gte: parseFloat(minSafetyRating) };
        }

        if (safetyFeature) {
            filter.safetyFeatures = { $in: [safetyFeature] };
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const routes = await Route.find(filter).sort({ averageRating: -1, createdAt: -1 });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (route) {
            res.json(route);
        } else {
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (route) {
            await route.deleteOne();
            res.json({ message: 'Route removed' });
        } else {
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute
};
