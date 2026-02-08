const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'abandoned'],
        default: 'ongoing'
    },
    gpsPoints: [{
        lat: Number,
        lng: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    distanceCovered: {
        type: Number, // in meters
        default: 0
    },
    completionPercentage: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    // Environmental impact
    co2Saved: {
        type: Number,
        default: 0 // in grams
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ride', rideSchema);
