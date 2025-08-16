const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { generateToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await authService.register(req.body);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  
  try {
    const user = await authService.login(req.body);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    // Custom handling for inactive user error
    if (error.inactive) {
      return res.status(403).json({ message: error.message, inactive: true });
    }
    // For other errors, let the centralized handler manage it
    res.status(401); // Unauthorized
    throw error;
  }
});

// @desc    Reactivate a user account
// @route   POST /api/auth/reactivate
// @access  Public
exports.reactivateAccount = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  const result = await authService.reactivate(req.body.email);
  res.json(result);
});