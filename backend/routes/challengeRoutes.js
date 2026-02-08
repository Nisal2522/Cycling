const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createChallenge,
    getAllChallenges,
    getChallenge,
    joinChallenge,
    updateProgress,
    updateChallenge,
    deleteChallenge
} = require('../controllers/challengeController');

router.post('/', protect, createChallenge);
router.get('/', getAllChallenges);
router.get('/:id', getChallenge);
router.post('/:id/join', protect, joinChallenge);
router.put('/:id/update-progress', protect, updateProgress);
router.put('/:id', protect, updateChallenge);
router.delete('/:id', protect, deleteChallenge);

module.exports = router;
