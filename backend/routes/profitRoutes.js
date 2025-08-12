const express = require('express');
const { distributeProfitNow , getProfitStatus  } = require('../controllers/profitController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/distribute', protect, adminOnly, distributeProfitNow);
router.get('/status', protect, adminOnly, getProfitStatus);

module.exports = router;
