const express = require('express');
const { distributeProfitNow } = require('../controllers/profitController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/distribute', protect, adminOnly, distributeProfitNow);

module.exports = router;
