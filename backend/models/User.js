const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  balance: { type: Number, default: 0 }, // money in their account from profit share
  contributions: { type: Number, default: 0 }, // total contributed
  reservedProfit: { type: Number, default: 0 } ,// Profit reserved due to pending dues
  isActive: { // Yeh naya field hai
    type: Boolean,
    default: true
  },
   isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  }
}, { timestamps: true });

// Encrypt password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
