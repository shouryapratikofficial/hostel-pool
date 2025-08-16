const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const { checkWeeklyContributions } = require('../cron/weeklyDues');

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res) => {
    const dashboardData = await userService.getDashboardData(req.user._id);
    res.json(dashboardData);
});

// @desc    Withdraw balance from account
// @route   POST /api/users/account/withdraw
// @access  Private
exports.withdrawBalance = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const user = await userService.withdrawUserBalance(req.user._id, parseInt(amount));
    res.json({ message: `Successfully withdrew ₹${amount}. Your new balance is ₹${user.balance}.` });
});

// @desc    Deactivate user account
// @route   PATCH /api/users/account/deactivate
// @access  Private
exports.deactivateAccount = asyncHandler(async (req, res) => {
    const result = await userService.deactivateUserAccount(req.user._id);
    res.json(result);
});

// ------------------- ADMIN ROUTES -------------------

// @desc    Get all users
// @route   GET /api/users/all-users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsersData();
    res.json(users);
});

// @desc    Get admin dashboard stats
// @route   GET /api/users/admin/dashboard
// @access  Admin
exports.getAdminDashboardStats = asyncHandler(async (req, res) => {
    const stats = await userService.getAdminStats();
    res.json(stats);
});

// @desc    Get admin settings
// @route   GET /api/users/admin/settings
// @access  Admin
exports.getAdminSettings = asyncHandler(async (req, res) => {
    const settings = await userService.getSettings();
    res.json(settings);
});

// @desc    Update admin settings
// @route   PATCH /api/users/admin/settings
// @access  Admin
exports.updateAdminSettings = asyncHandler(async (req, res) => {
    const updatedSettings = await userService.updateSettings(req.body);
    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
});

// @desc    Manually trigger dues check for testing
// @route   GET /api/users/admin/test-dues
// @access  Admin
exports.testDues = asyncHandler(async (req, res) => {
    await checkWeeklyContributions();
    res.send('Weekly dues check completed. Check console and database.');
});