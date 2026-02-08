const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'city_planner'],
        default: 'user'
    },
    totalDistance: {
        type: Number,
        default: 0 // in kilometers
    },
    completedRoutes: {
        type: Number,
        default: 0
    },
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    // Points and rewards system
    points: {
        type: Number,
        default: 0
    },
    pointsHistory: [{
        source: String, // 'ride_completion', 'distance_milestone', 'review', etc.
        amount: Number,
        description: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    currentStreak: {
        type: Number,
        default: 0 // days
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastRideDate: {
        type: Date
    },
    // Environmental impact
    co2Saved: {
        type: Number,
        default: 0 // in grams
    },
    environmentalImpact: {
        treesEquivalent: {
            type: Number,
            default: 0 // 1 tree = ~21kg CO2/year
        },
        carKmEquivalent: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    // Skip if password hasn't been modified
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
