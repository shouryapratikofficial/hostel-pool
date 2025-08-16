const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const register = async (userData) => {
  const { name, email, password} = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });
  return user;
};

const login = async (credentials) => {
  const { email, password } = credentials;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
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
};