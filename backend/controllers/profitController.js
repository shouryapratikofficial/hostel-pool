const User = require('../models/User');
const Profit = require('../models/Profit');
const ProfitHistory = require('../models/ProfitHistory');
const Notification = require('../models/Notification');
// backend/controllers/profitController.js
exports.getProfitHistory = async (req, res) => {
  try {
    const history = await ProfitHistory.find({ user: req.user._id }).sort({ distributionDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New function to get the profit status
exports.getProfitStatus = async (req, res) => {
  try {
    const profit = await Profit.findOne();
    res.json({ totalProfit: profit?.totalProfit || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.distributeProfitNow = async (req, res) => {
  try {
    const profit = await Profit.findOne();
    if (!profit || profit.totalProfit <= 0) {
      return res.status(400).json({ message: 'No profit to distribute' });
    }

    const users = await User.find();
    if (users.length === 0) return res.status(400).json({ message: 'No users found' });

    const share = profit.totalProfit / users.length;

    for (let user of users) {
      user.balance += share;
      await user.save();

      // NEW: Create a notification for each user
      await Notification.create({
        user: user._id,
        message: `You have received ₹${share.toFixed(2)} from the monthly profit distribution.`,
        link: '/profit',
      });
    }

    

    const profitHistoryEntries = users.map(user => ({
      user: user._id,
      amount: share
    }));

    await ProfitHistory.insertMany(profitHistoryEntries);

    profit.totalProfit = 0;
    await profit.save();

    res.json({ message: `Distributed profit of ${share} to each user and reset pool` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
