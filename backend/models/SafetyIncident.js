const mongoose = require('mongoose');

const safetyIncidentSchema = new mongoose.Schema({
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
    type: {
        type: String,
        required: true,
        enum: ['hazard', 'accident', 'unsafe_condition', 'infrastructure_issue', 'other']
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['reported', 'investigating', 'resolved', 'dismissed'],
        default: 'reported'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin/moderator who resolved it
    },
    resolvedAt: {
        type: Date
    },
    resolutionNotes: {
        type: String,
        maxlength: 500
    },
    images: [{
        type: String // URLs to uploaded images
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('SafetyIncident', safetyIncidentSchema);
