const cron = require('node-cron');
const User = require('../models/User');
const Profit = require('../models/Profit');
const ProfitHistory = require('../models/ProfitHistory');
const Notification = require('../models/Notification');
const Dues = require('../models/Dues');
const Contribution = require('../models/Contribution');

// Helper function to get the number of weeks passed in the previous month
const getWeeksInMonth = (date) => {
    const d = new Date(date);
    // Move to the last day of the previous month
    d.setDate(0); 
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return Math.ceil((start.getDay() + end.getDate()) / 7);
};


const distributeMonthlyProfit = async () => {
  console.log('Running monthly profit distribution cron job...');
  try {
    const profit = await Profit.findOne();
    if (!profit || profit.totalProfit <= 0) {
      return console.log('No profit to distribute this month.');
    }

    const allUsers = await User.find({ isActive: true });
    if (allUsers.length === 0) return;

    const today = new Date();
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    const weeksInPreviousMonth = getWeeksInMonth(today);
    
    const eligibleUsers = [];

    for (let user of allUsers) {
      const contributionsCount = await Contribution.countDocuments({
        user: user._id,
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      });
      
      let requiredContributions = weeksInPreviousMonth;
      if (user.createdAt >= startOfPreviousMonth) {
          const weeksSinceJoined = Math.ceil((endOfPreviousMonth.getDate() - user.createdAt.getDate() + 1) / 7);
          requiredContributions = weeksSinceJoined > 0 ? weeksSinceJoined : 1;
      }

      if (contributionsCount >= requiredContributions) {
        eligibleUsers.push(user);
      }
    }

    if (eligibleUsers.length === 0) {
      console.log('No users were eligible for last month\'s profit.');
      return;
    }

    const share = profit.totalProfit / eligibleUsers.length;

    for (let user of eligibleUsers) {
      const pendingDues = await Dues.findOne({ user: user._id, status: 'pending' });

      if (pendingDues) {
        user.reservedProfit += share;
      } else {
        user.balance += share;
      }
      await user.save();

      await Notification.create({
        user: user._id,
        message: `You have received ₹${share.toFixed(2)} from the monthly profit distribution.`,
        link: '/profit',
      });
      
      await ProfitHistory.create({ user: user._id, amount: share });
    }
    
    const distributedAmount = profit.totalProfit;
    profit.totalProfit = 0;
    await profit.save();

    console.log(`Distributed total profit of ₹${distributedAmount.toFixed(2)} among ${eligibleUsers.length} eligible members.`);
    
  } catch (error) {
    console.error('Error during monthly profit distribution cron:', error);
  }
};

// Har mahine ki pehli taarikh ko subah 2 baje chalega
cron.schedule('0 2 1 * *', distributeMonthlyProfit);

console.log('✅ Monthly profit distribution cron job scheduled with eligibility checks.');