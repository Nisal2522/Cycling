const SafetyIncident = require('../models/SafetyIncident');
const User = require('../models/User');

// @desc    Create a new safety incident
// @route   POST /api/safety-incidents
// @access  Private
const createIncident = async (req, res) => {
    try {
        const { routeId, type, location, description, severity, images } = req.body;

        if (!routeId || !type || !location || !description) {
            return res.status(400).json({ 
                message: 'Route ID, type, location, and description are required' 
            });
        }

        const incident = await SafetyIncident.create({
            route: routeId,
            user: req.user._id,
            type,
            location,
            description,
            severity: severity || 'medium',
            images: images || []
        });

        // Award points for reporting
        const user = await User.findById(req.user._id);
        user.points += 15;
        user.pointsHistory.push({
            source: 'safety_report',
            amount: 15,
            description: 'Reported safety incident'
        });
        await user.save();

        const populatedIncident = await SafetyIncident.findById(incident._id)
            .populate('user', 'name email')
            .populate('route', 'name');

        res.status(201).json(populatedIncident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all safety incidents
// @route   GET /api/safety-incidents
// @access  Private (Admin/Moderator/City Planner)
const getAllIncidents = async (req, res) => {
    try {
        const { status, severity, routeId } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (routeId) filter.route = routeId;

        const incidents = await SafetyIncident.find(filter)
            .populate('user', 'name email')
            .populate('route', 'name')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(incidents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get incidents for a specific route
// @route   GET /api/safety-incidents/route/:routeId
// @access  Public
const getIncidentsByRoute = async (req, res) => {
    try {
        const incidents = await SafetyIncident.find({ 
            route: req.params.routeId,
            status: { $ne: 'resolved' } // Only show unresolved
        })
            .populate('user', 'name')
            .sort({ severity: -1, createdAt: -1 });

        res.json(incidents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my reported incidents
// @route   GET /api/safety-incidents/my-incidents
// @access  Private
const getMyIncidents = async (req, res) => {
    try {
        const incidents = await SafetyIncident.find({ user: req.user._id })
            .populate('route', 'name')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(incidents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single incident
// @route   GET /api/safety-incidents/:id
// @access  Private
const getIncident = async (req, res) => {
    try {
        const incident = await SafetyIncident.findById(req.params.id)
            .populate('user', 'name email')
            .populate('route', 'name')
            .populate('resolvedBy', 'name email');

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update incident status (Admin/Moderator only)
// @route   PUT /api/safety-incidents/:id
// @access  Private (Admin/Moderator)
const updateIncident = async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const incident = await SafetyIncident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        const { status, severity, resolutionNotes } = req.body;

        if (status) {
            incident.status = status;
            if (status === 'resolved') {
                incident.resolvedBy = req.user._id;
                incident.resolvedAt = Date.now();
            }
        }
        if (severity) incident.severity = severity;
        if (resolutionNotes) incident.resolutionNotes = resolutionNotes;

        await incident.save();

        const populatedIncident = await SafetyIncident.findById(incident._id)
            .populate('user', 'name email')
            .populate('route', 'name')
            .populate('resolvedBy', 'name');

        res.json(populatedIncident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an incident
// @route   DELETE /api/safety-incidents/:id
// @access  Private (Admin/Moderator)
const deleteIncident = async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const incident = await SafetyIncident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        await incident.deleteOne();

        res.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createIncident,
    getAllIncidents,
    getIncidentsByRoute,
    getMyIncidents,
    getIncident,
    updateIncident,
    deleteIncident
};
