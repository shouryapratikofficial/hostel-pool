const mongoose = require('mongoose');

const duesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String, // Jaise 'Weekly contribution missed for Week 32'
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  weekIdentifier: { // Isse hum pehchanenge ki yeh kis hafte ka due hai
    type: String, // e.g., "2025-W33" for 33rd week of 2025
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Dues', duesSchema);