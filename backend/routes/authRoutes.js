const express = require('express');
const { registerUser, loginUser , reactivateAccount } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reactivate', reactivateAccount); // Naya route

module.exports = router;
