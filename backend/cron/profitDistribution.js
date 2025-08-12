const cron = require('node-cron');
const User = require('../models/User');
const Profit = require('../models/Profit');

cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('Running monthly profit distribution...');

    const profit = await Profit.findOne();
    if (!profit || profit.totalProfit <= 0) {
      return console.log('No profit to distribute this month.');
    }

    const users = await User.find();
    if (users.length === 0) return;

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

    profit.totalProfit = 0;
    await profit.save();

    console.log(`Distributed profit of ${profit.totalProfit} equally among ${users.length} members and reset pool.`);
  } catch (error) {
    console.error('Error during monthly distribution:', error.message);
  }
});
