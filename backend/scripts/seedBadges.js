const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('../models/Badge');

dotenv.config();

const badges = [
    {
        name: 'First Ride',
        description: 'Complete your first cycling route',
        icon: '🚴',
        condition: 'first_ride'
    },
    {
        name: '5 Routes Completed',
        description: 'Complete 5 different routes',
        icon: '🏅',
        condition: 'routes_5'
    },
    {
        name: '25km Total Ride',
        description: 'Cycle a total of 25 kilometers',
        icon: '⭐',
        condition: 'distance_25km'
    },
    {
        name: 'Environmental Champion',
        description: 'Save 100kg of CO2 emissions',
        icon: '🌱',
        condition: 'co2_100kg'
    },
    {
        name: 'Marathon Rider',
        description: 'Complete a 50km ride in one session',
        icon: '🏆',
        condition: 'distance_50km_single'
    },
    {
        name: 'Weekly Warrior',
        description: 'Ride 7 days in a row',
        icon: '🔥',
        condition: 'streak_7days'
    },
    {
        name: 'Safety Advocate',
        description: 'Report 10 safety incidents',
        icon: '🛡️',
        condition: 'safety_reports_10'
    },
    {
        name: 'Explorer',
        description: 'Complete 10 different routes',
        icon: '🗺️',
        condition: 'routes_10'
    },
    {
        name: 'Community Helper',
        description: 'Write 20 route reviews',
        icon: '💬',
        condition: 'reviews_20'
    },
    {
        name: 'Century Rider',
        description: 'Cycle a total of 100 kilometers',
        icon: '💯',
        condition: 'distance_100km'
    }
];

const seedBadges = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing badges
        await Badge.deleteMany({});
        console.log('Cleared existing badges');

        // Insert badges
        const createdBadges = await Badge.insertMany(badges);
        console.log(`✅ Created ${createdBadges.length} badges:`);
        
        createdBadges.forEach(badge => {
            console.log(`   - ${badge.icon} ${badge.name}: ${badge.description}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding badges:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedBadges();
