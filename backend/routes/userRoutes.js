const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();
const { getDashboard , getAllUsers, getAdminDashboardStats, getAdminSettings, updateAdminSettings , withdrawBalance , deactivateAccount , testDues } = require('../controllers/userController'); // Import the new function
const { checkWeeklyContributions } = require('../cron/weeklyDues');



router.get('/dashboard', protect, getDashboard);
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});
router.post('/account/withdraw', protect, withdrawBalance);
router.patch('/account/deactivate', protect, deactivateAccount);

// Admin-only routes
router.get('/all-users', protect, adminOnly, getAllUsers);
router.get('/admin/dashboard', protect, adminOnly, getAdminDashboardStats); // New admin route
router.get('/admin/settings', protect, adminOnly, getAdminSettings);
router.patch('/admin/settings', protect, adminOnly, updateAdminSettings);

//admin check
router.get('/admin/test-dues', protect, adminOnly, testDues); 

module.exports = router;