const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Ride = require('../models/Ride');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Admin/City Planner)
const createChallenge = async (req, res) => {
    try {
        if (!['admin', 'city_planner'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { name, description, type, target, startDate, endDate, rewards } = req.body;

        if (!name || !description || !type || !target || !endDate) {
            return res.status(400).json({ 
                message: 'Name, description, type, target, and endDate are required' 
            });
        }

        const challenge = await Challenge.create({
            name,
            description,
            type,
            target,
            startDate: startDate || Date.now(),
            endDate,
            rewards: rewards || {},
            createdBy: req.user._id
        });

        const populatedChallenge = await Challenge.findById(challenge._id)
            .populate('createdBy', 'name email');

        res.status(201).json(populatedChallenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active challenges
// @route   GET /api/challenges
// @access  Public
const getAllChallenges = async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        } else {
            filter.isActive = true;
        }

        const challenges = await Challenge.find(filter)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single challenge
// @route   GET /api/challenges/:id
// @access  Public
const getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('participants.user', 'name email')
            .populate('rewards.badge', 'name icon');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
const joinChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (!challenge.isActive) {
            return res.status(400).json({ message: 'Challenge is not active' });
        }

        if (new Date() > challenge.endDate) {
            return res.status(400).json({ message: 'Challenge has ended' });
        }

        // Check if already joined
        const existingParticipant = challenge.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        if (existingParticipant) {
            return res.status(400).json({ message: 'You have already joined this challenge' });
        }

        challenge.participants.push({
            user: req.user._id,
            progress: 0
        });

        await challenge.save();

        const populatedChallenge = await Challenge.findById(challenge._id)
            .populate('participants.user', 'name email');

        res.json(populatedChallenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update challenge progress (called when user completes activities)
// @route   PUT /api/challenges/:id/update-progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const participant = challenge.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        if (!participant) {
            return res.status(400).json({ message: 'You are not participating in this challenge' });
        }

        // Calculate progress based on challenge type
        let newProgress = participant.progress;
        const { distance, routes, days } = req.body;

        switch (challenge.type) {
            case 'distance':
                newProgress += distance || 0;
                break;
            case 'routes':
                newProgress += routes || 0;
                break;
            case 'streak':
                newProgress = days || participant.progress;
                break;
            default:
                newProgress += 1;
        }

        participant.progress = newProgress;

        // Check if challenge completed
        if (newProgress >= challenge.target && !participant.completed) {
            participant.completed = true;
            participant.completedAt = Date.now();

            // Award rewards
            const user = await User.findById(req.user._id);
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
            await user.save();
        }

        await challenge.save();

        res.json(participant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a challenge
// @route   PUT /api/challenges/:id
// @access  Private (Admin/City Planner)
const updateChallenge = async (req, res) => {
    try {
        if (!['admin', 'city_planner'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const { name, description, target, endDate, isActive, rewards } = req.body;

        if (name) challenge.name = name;
        if (description) challenge.description = description;
        if (target) challenge.target = target;
        if (endDate) challenge.endDate = endDate;
        if (isActive !== undefined) challenge.isActive = isActive;
        if (rewards) challenge.rewards = rewards;

        await challenge.save();

        const populatedChallenge = await Challenge.findById(challenge._id)
            .populate('createdBy', 'name email');

        res.json(populatedChallenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Admin/City Planner)
const deleteChallenge = async (req, res) => {
    try {
        if (!['admin', 'city_planner'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        await challenge.deleteOne();

        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createChallenge,
    getAllChallenges,
    getChallenge,
    joinChallenge,
    updateProgress,
    updateChallenge,
    deleteChallenge
};
