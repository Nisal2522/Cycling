const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        required: true,
        enum: ['distance', 'routes', 'streak', 'community', 'environmental', 'safety']
    },
    target: {
        type: Number,
        required: true // Target value (km, routes, days, etc.)
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        progress: {
            type: Number,
            default: 0
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        }
    }],
    rewards: {
        points: {
            type: Number,
            default: 0
        },
        badge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Badge'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
