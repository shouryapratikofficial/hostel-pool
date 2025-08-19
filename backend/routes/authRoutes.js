const express = require('express');
const { registerUser, loginUser, reactivateAccount , verifyUserOtp } = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit'); // 1. Import rate-limit

// 2. Create a limiter configuration
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const router = express.Router();

// 3. Apply the limiter to the routes
router.post(
    '/register',
    authLimiter, // Apply limiter
    [
        body('name', 'Name is required').not().isEmpty().trim().escape(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    registerUser
);
// New OTP verification route
router.post(
    '/verify-otp',
    authLimiter,
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('otp', 'OTP is required').isLength({ min: 6, max: 6 }),
    ],
    verifyUserOtp
);
router.post(
    '/login',
    authLimiter, // Apply limiter
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists()
    ],
    loginUser
);

router.post(
    '/reactivate',
    authLimiter, // Apply limiter
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail()
    ],
    reactivateAccount
);

module.exports = router;