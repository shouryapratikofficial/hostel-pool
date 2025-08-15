const express = require('express');
const { addContribution, getAllContributions, getCombinedHistory  , getContributionStatus } = require('../controllers/contributionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, addContribution);
//router.get('/my', protect, getMyContributions);
router.get('/history', protect, getCombinedHistory); // Yeh naya route hai

router.get('/all', protect, adminOnly, getAllContributions);
router.get('/status', protect, getContributionStatus);
module.exports = router;
