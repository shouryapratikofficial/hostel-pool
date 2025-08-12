const express = require('express');
const {
  requestLoan,
  approveLoan,
  repayLoan,
  getMyLoans,
  getAllLoans
} = require('../controllers/loanController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/request', protect, requestLoan);
router.patch('/:id/repay', protect, repayLoan);
router.get('/myloans', protect, getMyLoans);

// Admin routes
router.patch('/:id/approve', protect, adminOnly, approveLoan);
router.get('/all', protect, adminOnly, getAllLoans);

module.exports = router;
