const mongoose = require('mongoose');

const profitSchema = new mongoose.Schema({
  totalProfit: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Profit', profitSchema);
