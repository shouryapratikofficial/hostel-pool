const mongoose = require('mongoose');

// Sirf ek hi document hoga is collection mein, jisse settings hamesha ek jagah rahein
const adminSettingSchema = new mongoose.Schema({
  weeklyContributionAmount: {
    type: Number,
    required: true,
    default: 100 // Aap ek default value set kar sakte hain
  },
  lateFineAmount: {
    type: Number,
    required: true,
    default: 10 // Default fine amount
  },
  minimumWithdrawalAmount: { // Yeh naya field hai
    type: Number,
    required: true,
    default: 50 // Default minimum withdrawal amount
  },
  loanInterestRate: { // Yeh naya field hai (monthly interest)
    type: Number,
    required: true,
    default: 5, // Default interest rate 5%
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('AdminSetting', adminSettingSchema);