const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createReview,
    getReviewsByRoute,
    getMyReviews,
    getReview,
    updateReview,
    deleteReview,
    markHelpful
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/route/:routeId', getReviewsByRoute);
router.get('/my-reviews', protect, getMyReviews);
router.get('/:id', getReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;
