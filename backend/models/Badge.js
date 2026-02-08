const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // URL or icon name
        required: true
    },
    condition: {
        type: String, // e.g., 'first_ride', 'distance_25km'
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);
