const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    pointsRequired: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['discount', 'badge', 'certificate', 'physical_item', 'experience']
    },
    partner: {
        type: String, // Business name if applicable
        trim: true
    },
    discountCode: {
        type: String,
        trim: true
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    expiryDate: {
        type: Date
    },
    available: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number, // -1 for unlimited
        default: -1
    },
    redeemedCount: {
        type: Number,
        default: 0
    },
    image: {
        type: String // URL to reward image
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
