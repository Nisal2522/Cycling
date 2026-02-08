const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createIncident,
    getAllIncidents,
    getIncidentsByRoute,
    getMyIncidents,
    getIncident,
    updateIncident,
    deleteIncident
} = require('../controllers/safetyIncidentController');

router.post('/', protect, createIncident);
router.get('/', protect, getAllIncidents);
router.get('/route/:routeId', getIncidentsByRoute);
router.get('/my-incidents', protect, getMyIncidents);
router.get('/:id', protect, getIncident);
router.put('/:id', protect, updateIncident);
router.delete('/:id', protect, deleteIncident);

module.exports = router;
