const User = require('../models/User');
const Profit = require('../models/Profit');
const ProfitHistory = require('../models/ProfitHistory');
const Notification = require('../models/Notification');
const Dues = require('../models/Dues'); // Dues model
const Contribution = require('../models/Contribution'); // Contribution model
const Withdrawal = require('../models/Withdrawal'); // Withdrawal model 
const ActivityLog = require('../models/ActivityLog'); // ActivityLog model

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

const getWeeksInMonth = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return Math.ceil((start.getDay() + end.getDate()) / 7);
};

exports.distributeProfitNow = async (req, res) => {
  try {
    const profit = await Profit.findOne();
    if (!profit || profit.totalProfit <= 0) {
      return res.status(400).json({ message: 'No profit to distribute' });
    }

    const allUsers = await User.find({ isActive : true });  // Sabhi active users ko consider karein
    if (allUsers.length === 0) {
      return res.status(400).json({ message: 'No users found' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const weeksPassed = getWeeksInMonth(today);

    const eligibleUsers = [];

    // Har user ki eligibility check karein
    for (let user of allUsers) {



      // 1. Check for contributions this month
      const contributionsCount = await Contribution.countDocuments({
        user: user._id,
        createdAt: { $gte: startOfMonth },
      });
      
      // New user eligibility: Agar user isi mahine join hua hai, to uske liye weeks alag se calculate honge
      const userJoinedThisMonth = user.createdAt >= startOfMonth;
      let requiredContributions = weeksPassed;
      if(userJoinedThisMonth) {
          const weeksSinceJoined = Math.ceil((today.getDate() - user.createdAt.getDate() + 1) / 7);
          requiredContributions = weeksSinceJoined;
      }

      const deactivationLog = await ActivityLog.findOne({
        user: user._id,
        activityType: 'deactivated',
        createdAt: { $gte: startOfMonth }
      });

      if (contributionsCount >= requiredContributions && !deactivationLog) {
        eligibleUsers.push(user);
      }
    }

    if (eligibleUsers.length === 0) {
      return res.status(400).json({ message: 'No users are eligible for profit this month.' });
    }

    const share = profit.totalProfit / eligibleUsers.length;
    const profitHistoryEntries = [];

    for (let user of eligibleUsers) {
      // 2. Check for any pending dues
      const pendingDues = await Dues.findOne({ user: user._id, status: 'pending' });

      if (pendingDues) {
        // Agar dues hain, to profit reserve karein
        user.reservedProfit += share;
        console.log(`Reserving profit of ₹${share.toFixed(2)} for user ${user.name} due to pending dues.`);
      } else {
        // Agar dues nahi hain, to balance mein add karein
        user.balance += share;
        console.log(`Adding profit of ₹${share.toFixed(2)} to balance for user ${user.name}.`);
      }
      
      await user.save();

      // Notification banayein
      await Notification.create({
        user: user._id,
        message: `You have received ₹${share.toFixed(2)} from the profit distribution.`,
        link: '/profit',
      });
      
      // History entry banayein
      profitHistoryEntries.push({ user: user._id, amount: share });
    }

    await ProfitHistory.insertMany(profitHistoryEntries);

    const distributedAmount = profit.totalProfit;
    profit.totalProfit = 0; // Pool ko reset karein
    await profit.save();
   
    res.json({ message: `Distributed total profit of ₹${distributedAmount.toFixed(2)} among ${eligibleUsers.length} eligible users.` });

  } catch (error) {
    console.error('Error in distributeProfitNow:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const profits = await ProfitHistory.find({ user: userId }).lean();
    const withdrawals = await Withdrawal.find({ user: userId }).lean();

    const history = [];

    profits.forEach(p => {
      history.push({
        _id: p._id,
        type: 'Profit',
        amount: p.amount,
        date: p.distributionDate,
        transactionType: 'credit' // Jama hua
      });
    });

    withdrawals.forEach(w => {
      history.push({
        _id: w._id,
        type: 'Withdrawal',
        amount: w.amount,
        date: w.date,
        transactionType: 'debit' // Nikala gaya
      });
    });

    // History ko date ke hisaab se sort karein, sabse naya upar
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};