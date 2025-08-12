const mongoose = require('mongoose');

const poolFundSchema = new mongoose.Schema({
  totalContributions: { type: Number, default: 0 },  // sum of all contributions
  blockedAmount: { type: Number, default: 0 }         // amount lent out as loans but not yet repaid
});

module.exports = mongoose.model('PoolFund', poolFundSchema);
