const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { type = 'points', limit = 10 } = req.query;
        const limitNum = parseInt(limit);

        let sortField = 'points';
        switch (type) {
            case 'distance':
                sortField = 'totalDistance';
                break;
            case 'co2':
                sortField = 'co2Saved';
                break;
            case 'routes':
                sortField = 'completedRoutes';
                break;
            default:
                sortField = 'points';
        }

        const users = await User.find({})
            .select('name points totalDistance co2Saved completedRoutes')
            .sort({ [sortField]: -1 })
            .limit(limitNum);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLeaderboard
};
