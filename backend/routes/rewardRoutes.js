const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createReward,
    getAllRewards,
    getReward,
    redeemReward,
    updateReward,
    deleteReward,
    getMyRewards
} = require('../controllers/rewardController');

router.post('/', protect, createReward);
router.get('/', getAllRewards);
router.get('/my-rewards', protect, getMyRewards);
router.get('/:id', getReward);
router.post('/:id/redeem', protect, redeemReward);
router.put('/:id', protect, updateReward);
router.delete('/:id', protect, deleteReward);

module.exports = router;
