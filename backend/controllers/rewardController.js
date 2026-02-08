const Reward = require('../models/Reward');
const User = require('../models/User');

// @desc    Create a new reward
// @route   POST /api/rewards
// @access  Private (Admin)
const createReward = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { 
            name, 
            description, 
            pointsRequired, 
            type, 
            partner, 
            discountCode, 
            discountPercentage,
            expiryDate,
            stock,
            image 
        } = req.body;

        if (!name || !description || !pointsRequired || !type) {
            return res.status(400).json({ 
                message: 'Name, description, pointsRequired, and type are required' 
            });
        }

        const reward = await Reward.create({
            name,
            description,
            pointsRequired,
            type,
            partner,
            discountCode,
            discountPercentage,
            expiryDate,
            stock: stock !== undefined ? stock : -1,
            image,
            createdBy: req.user._id
        });

        const populatedReward = await Reward.findById(reward._id)
            .populate('createdBy', 'name email');

        res.status(201).json(populatedReward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all available rewards
// @route   GET /api/rewards
// @access  Public
const getAllRewards = async (req, res) => {
    try {
        const { type, minPoints, maxPoints } = req.query;
        const filter = { available: true };

        if (type) filter.type = type;
        if (minPoints) filter.pointsRequired = { $gte: minPoints };
        if (maxPoints) {
            filter.pointsRequired = { 
                ...filter.pointsRequired, 
                $lte: maxPoints 
            };
        }

        // Filter out expired rewards
        filter.$or = [
            { expiryDate: { $gte: new Date() } },
            { expiryDate: null }
        ];

        const rewards = await Reward.find(filter)
            .populate('createdBy', 'name')
            .sort({ pointsRequired: 1 });

        res.json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single reward
// @route   GET /api/rewards/:id
// @access  Public
const getReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        res.json(reward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Redeem a reward
// @route   POST /api/rewards/:id/redeem
// @access  Private
const redeemReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        if (!reward.available) {
            return res.status(400).json({ message: 'Reward is not available' });
        }

        if (reward.expiryDate && new Date() > reward.expiryDate) {
            return res.status(400).json({ message: 'Reward has expired' });
        }

        if (reward.stock !== -1 && reward.stock <= 0) {
            return res.status(400).json({ message: 'Reward is out of stock' });
        }

        const user = await User.findById(req.user._id);

        if (user.points < reward.pointsRequired) {
            return res.status(400).json({ 
                message: `Insufficient points. Required: ${reward.pointsRequired}, Available: ${user.points}` 
            });
        }

        // Deduct points
        user.points -= reward.pointsRequired;
        user.pointsHistory.push({
            source: 'reward_redemption',
            amount: -reward.pointsRequired,
            description: `Redeemed reward: ${reward.name}`
        });
        await user.save();

        // Update reward stock
        if (reward.stock !== -1) {
            reward.stock -= 1;
        }
        reward.redeemedCount += 1;
        await reward.save();

        res.json({
            message: 'Reward redeemed successfully',
            reward,
            remainingPoints: user.points,
            discountCode: reward.discountCode || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a reward
// @route   PUT /api/rewards/:id
// @access  Private (Admin)
const updateReward = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        const { 
            name, 
            description, 
            pointsRequired, 
            type, 
            partner, 
            discountCode,
            discountPercentage,
            expiryDate,
            available,
            stock,
            image 
        } = req.body;

        if (name) reward.name = name;
        if (description) reward.description = description;
        if (pointsRequired) reward.pointsRequired = pointsRequired;
        if (type) reward.type = type;
        if (partner !== undefined) reward.partner = partner;
        if (discountCode !== undefined) reward.discountCode = discountCode;
        if (discountPercentage !== undefined) reward.discountPercentage = discountPercentage;
        if (expiryDate !== undefined) reward.expiryDate = expiryDate;
        if (available !== undefined) reward.available = available;
        if (stock !== undefined) reward.stock = stock;
        if (image !== undefined) reward.image = image;

        await reward.save();

        const populatedReward = await Reward.findById(reward._id)
            .populate('createdBy', 'name email');

        res.json(populatedReward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a reward
// @route   DELETE /api/rewards/:id
// @access  Private (Admin)
const deleteReward = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        await reward.deleteOne();

        res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my redeemed rewards
// @route   GET /api/rewards/my-rewards
// @access  Private
const getMyRewards = async (req, res) => {
    try {
        // This would require a Redemption model to track user redemptions
        // For now, return user's points and available rewards
        const user = await User.findById(req.user._id);
        const availableRewards = await Reward.find({ 
            available: true,
            pointsRequired: { $lte: user.points }
        }).sort({ pointsRequired: 1 });

        res.json({
            points: user.points,
            availableRewards
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReward,
    getAllRewards,
    getReward,
    redeemReward,
    updateReward,
    deleteReward,
    getMyRewards
};
