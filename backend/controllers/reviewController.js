const Review = require('../models/Review');
const Route = require('../models/Route');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { routeId, rating, comment, safetyIssues } = req.body;

        if (!routeId || !rating) {
            return res.status(400).json({ message: 'Route ID and rating are required' });
        }

        // Check if user already reviewed this route
        const existingReview = await Review.findOne({ 
            route: routeId, 
            user: req.user._id 
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this route' });
        }

        const review = await Review.create({
            route: routeId,
            user: req.user._id,
            rating,
            comment,
            safetyIssues: safetyIssues || []
        });

        // Update route average rating
        await updateRouteRating(routeId);

        // Award points for review
        const user = await User.findById(req.user._id);
        user.points += 5;
        user.pointsHistory.push({
            source: 'review',
            amount: 5,
            description: 'Submitted route review'
        });
        await user.save();

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name email')
            .populate('route', 'name distance');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a route
// @route   GET /api/reviews/route/:routeId
// @access  Public
const getReviewsByRoute = async (req, res) => {
    try {
        const reviews = await Review.find({ route: req.params.routeId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews by a user
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('route', 'name distance difficulty')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
const getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'name email')
            .populate('route', 'name distance');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin/moderator
        if (review.user.toString() !== req.user._id.toString() && 
            !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { rating, comment, safetyIssues } = req.body;

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (safetyIssues) review.safetyIssues = safetyIssues;

        await review.save();

        // Update route rating if rating changed
        if (rating) {
            await updateRouteRating(review.route);
        }

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name email')
            .populate('route', 'name distance');

        res.json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin/moderator
        if (review.user.toString() !== req.user._id.toString() && 
            !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const routeId = review.route;
        await review.deleteOne();

        // Update route rating
        await updateRouteRating(routeId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.helpfulUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already marked this as helpful' });
        }

        review.helpful += 1;
        review.helpfulUsers.push(req.user._id);
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update route average rating
const updateRouteRating = async (routeId) => {
    const reviews = await Review.find({ route: routeId });
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Route.findByIdAndUpdate(routeId, {
            averageRating: avgRating.toFixed(1),
            reviewCount: reviews.length
        });
    }
};

module.exports = {
    createReview,
    getReviewsByRoute,
    getMyReviews,
    getReview,
    updateReview,
    deleteReview,
    markHelpful
};
