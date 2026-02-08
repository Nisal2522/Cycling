const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    safetyIssues: [{
        type: String,
        enum: ['heavy_traffic', 'poor_lighting', 'potholes', 'no_bike_lane', 'dangerous_intersection', 'other']
    }],
    helpful: {
        type: Number,
        default: 0 // upvotes
    },
    helpfulUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false // Admin/moderator verified
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews from same user for same route
reviewSchema.index({ route: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
