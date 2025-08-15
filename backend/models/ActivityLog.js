const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['deactivated', 'reactivated'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);