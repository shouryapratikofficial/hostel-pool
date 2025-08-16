const express = require('express');
const { body, param } = require('express-validator');
const {
  requestLoan,
  approveLoan,
  repayLoan,
  getMyLoans,
  getAllLoans,
  rejectLoan,
  getRepaymentDetails
} = require('../controllers/loanController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

const validateMongoId = param('id').isMongoId().withMessage('Invalid ID format');

// User routes
router.post('/request', protect, [
    body('amount').isInt({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('purpose').not().isEmpty().trim().escape().withMessage('Purpose is required')
], requestLoan);

router.patch('/:id/repay', protect, validateMongoId, repayLoan);
router.get('/myloans', protect, getMyLoans);
router.get('/:id/repayment-details', protect, validateMongoId, getRepaymentDetails);

// Admin routes
router.patch('/:id/approve', protect, adminOnly, validateMongoId, approveLoan);
router.patch('/:id/reject', protect, adminOnly, validateMongoId, rejectLoan);
router.get('/all', protect, adminOnly, getAllLoans);

module.exports = router;