const express = require('express');
const router = express.Router();
const {
    startRide,
    updateRide,
    finishRide,
    getMyRides
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.route('/start').post(protect, startRide);
router.route('/myrides').get(protect, getMyRides);
router.route('/:id/update').put(protect, updateRide);
router.route('/:id/finish').put(protect, finishRide);

module.exports = router;
