const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();
const { getDashboard , getAllUsers, getAdminDashboardStats } = require('../controllers/userController'); // Import the new function

router.get('/dashboard', protect, getDashboard);

router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

// Admin-only routes
router.get('/all-users', protect, adminOnly, getAllUsers);
router.get('/admin/dashboard', protect, adminOnly, getAdminDashboardStats); // New admin route

module.exports = router;