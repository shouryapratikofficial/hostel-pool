const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  purpose: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'repaid', 'rejected'],
    default: 'pending'
  },
  interest: {
    type: Number,
    default: 0
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  repaidAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
   repaidAmount: { // Naya field
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
