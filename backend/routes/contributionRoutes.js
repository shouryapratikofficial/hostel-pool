const express = require('express');
const { body } = require('express-validator');
const { addContribution, getAllContributions, getCombinedHistory, getContributionStatus } = require('../controllers/contributionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', protect, [
    body('amount').isInt({ gt: 0 }).withMessage('Amount must be a positive number')
], addContribution);

router.get('/history', protect, getCombinedHistory);
router.get('/all', protect, adminOnly, getAllContributions);
router.get('/status', protect, getContributionStatus);

module.exports = router;