const express = require('express');
const { addContribution, getAllContributions, getMyContributions } = require('../controllers/contributionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, addContribution);
router.get('/my', protect, getMyContributions);
router.get('/all', protect, adminOnly, getAllContributions);

module.exports = router;
