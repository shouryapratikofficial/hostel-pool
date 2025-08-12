const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();
const { getDashboard } = require('../controllers/userController');

router.get('/dashboard', protect, getDashboard);

router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

// Example admin-only route
router.get('/all-users', protect, adminOnly, (req, res) => {
  res.json({ message: 'Only admin can see this' });
});

module.exports = router;
