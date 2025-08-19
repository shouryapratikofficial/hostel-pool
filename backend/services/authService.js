const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendOtpEmail } = require('../utils/emailService');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (userData) => {
  const { name, email, password} = userData;
let user = await User.findOne({ email });
  if (user) {
        // Agar user hai aur pehle se verified hai, toh error do
        if (user.isVerified) {
            throw new Error('User with this email already exists and is verified.');
        }

        // Agar user hai par verified nahi, toh details update karo aur naya OTP bhejo
        user.name = name;
        user.password = password; // Password save hone se pehle automatically hash ho jayega (pre-save hook ke kaaran)
        
    } else {
        // Agar user nahi hai, toh naya banao
        user = new User({ name, email, password });
    }

  
  // Generate and save OTP
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  await user.save();

  // Send OTP email
  await sendOtpEmail(email, otp);

  return user;
};

const verifyOtp = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
        throw new Error('Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return user;
};

const login = async (credentials) => {
  const { email, password } = credentials;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
     if (!user.isVerified) {
        throw new Error('Please verify your email first.');
    }
    if (!user.isActive) {
      const error = new Error('This account is currently inactive.');
      error.inactive = true; // Attach a flag for the controller to check
      throw error;
    }
    return user;
  } else {
    throw new Error('Invalid email or password');
  }
};

const reactivate = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found.');
  }

  user.isActive = true;
  await user.save();
  await ActivityLog.create({ user: user._id, activityType: 'reactivated' });

  return { message: 'Your account has been reactivated. Please login again.' };
};

module.exports = {
  register,
  login,
  reactivate,
  verifyOtp
};