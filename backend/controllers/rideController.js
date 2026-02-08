const Ride = require('../models/Ride');
const Route = require('../models/Route');
const User = require('../models/User');

// Helper to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// @desc    Start a new ride
// @route   POST /api/rides/start
// @access  Private
const startRide = async (req, res) => {
    try {
        const { routeId } = req.body;

        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        const ride = await Ride.create({
            user: req.user._id,
            route: routeId,
            status: 'ongoing',
            gpsPoints: [],
            distanceCovered: 0,
            completionPercentage: 0
        });

        res.status(201).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ride progress with new GPS points
// @route   PUT /api/rides/:id/update
// @access  Private
const updateRide = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (ride.status !== 'ongoing') {
            return res.status(400).json({ message: 'Ride is not active' });
        }

        // Add new point
        const newPoint = { lat, lng, timestamp: Date.now() };
        ride.gpsPoints.push(newPoint);

        // Calculate distance added if there's a previous point
        if (ride.gpsPoints.length > 1) {
            const lastPoint = ride.gpsPoints[ride.gpsPoints.length - 2];
            const distance = calculateDistance(lastPoint.lat, lastPoint.lng, lat, lng);
            ride.distanceCovered += distance;
        }

        // Calculate percentage (assuming Route distance is in km, convert ride distance to km)
        // Or if Route distance is in meters. Let's assume Route.distance is in km.
        const route = await Route.findById(ride.route);
        // Convert distanceCovered (m) to km
        const coveredKm = ride.distanceCovered / 1000;

        let percentage = 0;
        if (route.distance > 0) {
            percentage = (coveredKm / route.distance) * 100;
        }

        // Cap at 100 for now, logic can be more complex
        ride.completionPercentage = Math.min(percentage, 100);

        await ride.save();

        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Finish a ride manually
// @route   PUT /api/rides/:id/finish
// @access  Private
const finishRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        ride.status = 'completed';
        ride.endTime = Date.now();
        
        // Calculate CO2 saved (99g per km)
        const distanceKm = ride.distanceCovered / 1000;
        const co2Saved = distanceKm * 99; // grams
        ride.co2Saved = co2Saved;
        
        // Calculate points earned
        let pointsEarned = 10; // Base points for completing a route
        if (distanceKm >= 5) pointsEarned += 25;
        if (distanceKm >= 10) pointsEarned += 50;
        if (distanceKm >= 25) pointsEarned += 150;
        ride.pointsEarned = pointsEarned;
        
        await ride.save();

        // Update User stats
        const user = await User.findById(req.user._id);
        const previousDistance = user.totalDistance;
        user.totalDistance += distanceKm;
        user.completedRoutes += 1;
        
        // Update CO2 saved
        user.co2Saved += co2Saved;
        user.environmentalImpact.treesEquivalent = (user.co2Saved / 21000).toFixed(2); // 1 tree = 21kg CO2
        user.environmentalImpact.carKmEquivalent = (user.co2Saved / 120).toFixed(2); // Car emits 120g/km
        
        // Update points
        user.points += pointsEarned;
        user.pointsHistory.push({
            source: 'ride_completion',
            amount: pointsEarned,
            description: `Completed ride: ${distanceKm.toFixed(2)}km`
        });
        
        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastRideDate = user.lastRideDate ? new Date(user.lastRideDate) : null;
        
        if (!lastRideDate || lastRideDate < today) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (!lastRideDate || lastRideDate.getTime() === yesterday.getTime()) {
                user.currentStreak += 1;
            } else {
                user.currentStreak = 1;
            }
            
            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
            
            user.lastRideDate = today;
        }
        
        await user.save();

        // Check for badges
        const badges = [];
        const Badge = require('../models/Badge');
        
        // 1. First Ride
        if (user.completedRoutes === 1) {
            badges.push('First Ride');
        }
        // 2. 5 Routes Completed
        if (user.completedRoutes === 5) {
            badges.push('5 Routes Completed');
        }
        // 3. 25km Total Ride
        if (user.totalDistance >= 25 && previousDistance < 25) {
            badges.push('25km Total Ride');
        }
        // 4. Environmental Champion (100kg CO2 saved)
        if (user.co2Saved >= 100000 && (user.co2Saved - co2Saved) < 100000) {
            badges.push('Environmental Champion');
        }
        // 5. Marathon Rider (50km in one ride)
        if (distanceKm >= 50) {
            badges.push('Marathon Rider');
        }
        // 6. Weekly Warrior (7 day streak)
        if (user.currentStreak >= 7) {
            badges.push('Weekly Warrior');
        }

        if (badges.length > 0) {
            // Find badge IDs (assuming badges are seeded)
            const badgeDocs = await Badge.find({ name: { $in: badges } });
            const badgeIds = badgeDocs.map(b => b._id);
            user.badges.push(...badgeIds);
            await user.save();
        }

        // Update challenge progress if user is participating
        const Challenge = require('../models/Challenge');
        const activeChallenges = await Challenge.find({ 
            isActive: true,
            'participants.user': user._id,
            endDate: { $gte: new Date() }
        });
        
        for (const challenge of activeChallenges) {
            const participant = challenge.participants.find(
                p => p.user.toString() === user._id.toString()
            );
            
            if (participant && !participant.completed) {
                let newProgress = participant.progress;
                
                switch (challenge.type) {
                    case 'distance':
                        newProgress += distanceKm;
                        break;
                    case 'routes':
                        newProgress += 1;
                        break;
                    case 'streak':
                        newProgress = user.currentStreak;
                        break;
                }
                
                participant.progress = newProgress;
                
                if (newProgress >= challenge.target) {
                    participant.completed = true;
                    participant.completedAt = Date.now();
                    
                    // Award challenge rewards
                    if (challenge.rewards.points) {
                        user.points += challenge.rewards.points;
                        user.pointsHistory.push({
                            source: 'challenge_completion',
                            amount: challenge.rewards.points,
                            description: `Completed challenge: ${challenge.name}`
                        });
                    }
                    if (challenge.rewards.badge) {
                        user.badges.push(challenge.rewards.badge);
                    }
                }
                
                await challenge.save();
            }
        }
        
        await user.save();

        res.json({ 
            message: 'Ride completed', 
            ride, 
            newBadges: badges,
            pointsEarned,
            co2Saved: co2Saved.toFixed(2),
            totalPoints: user.points,
            totalCo2Saved: (user.co2Saved / 1000).toFixed(2) // Convert to kg
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user rides
// @route   GET /api/rides/myrides
// @access  Private
const getMyRides = async (req, res) => {
    try {
        const rides = await Ride.find({ user: req.user._id }).populate('route', 'name distance difficulty');
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    startRide,
    updateRide,
    finishRide,
    getMyRides
};
