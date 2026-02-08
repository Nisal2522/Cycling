const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    distance: {
        type: Number, // in kilometers
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    polyline: [{
        lat: Number,
        lng: Number
    }],
    originAddress: {
        type: String,
        trim: true
    },
    destinationAddress: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Safety features
    safetyRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    safetyFeatures: [{
        type: String,
        enum: ['bike_lane', 'dedicated_path', 'low_traffic', 'well_lit', 'traffic_calmed', 'separated_lane']
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    safetyWarnings: [{
        type: String,
        default: []
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
