const express = require('express');
const {
  getRepaymentDetails,
  requestLoan,
  approveLoan,
  repayLoan,
  getMyLoans,
  getAllLoans,
  rejectLoan // New function import karein
} = require('../controllers/loanController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/request', protect, requestLoan);
router.patch('/:id/repay', protect, repayLoan);
router.get('/myloans', protect, getMyLoans);
router.get('/:id/repayment-details', protect, getRepaymentDetails);

// Admin routes
router.patch('/:id/approve', protect, adminOnly, approveLoan);
router.patch('/:id/reject', protect, adminOnly, rejectLoan); // New admin route
router.get('/all', protect, adminOnly, getAllLoans);

module.exports = router;