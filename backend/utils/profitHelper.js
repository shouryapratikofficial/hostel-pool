const User = require('../models/User');
const Profit = require('../models/Profit');
const Contribution = require('../models/Contribution');
const Dues = require('../models/Dues');
const Notification = require('../models/Notification');
const ProfitHistory = require('../models/ProfitHistory');
const ActivityLog = require('../models/ActivityLog');

// NAYA, SAHI LOGIC
const distributeProfitForMonth = async (dateForCalculation) => {
    console.log(`Running profit distribution for the month preceding ${dateForCalculation.toDateString()}`);

    const profit = await Profit.findOne();
    if (!profit || profit.totalProfit <= 0) {
        return { success: false, message: 'No profit to distribute.' };
    }

    const allUsers = await User.find({ isActive: true });
    if (allUsers.length === 0) {
        return { success: false, message: 'No active users found.' };
    }

    // Pichle mahine ki pehli aur aakhri taarikh nikaalo
    const startOfPreviousMonth = new Date(dateForCalculation.getFullYear(), dateForCalculation.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(dateForCalculation.getFullYear(), dateForCalculation.getMonth(), 0, 23, 59, 59);

    // Pichle mahine mein kitne Saturday (deadlines) the, woh gino
    let requiredContributions = 0;
    let tempDate = new Date(startOfPreviousMonth);
    while (tempDate <= endOfPreviousMonth) {
        if (tempDate.getDay() === 6) { // 6 = Saturday
            requiredContributions++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
    }
    
    if (requiredContributions === 0) {
        return { success: false, message: 'No contribution deadlines found for the previous month.' };
    }

    console.log(`Required contributions for the previous month: ${requiredContributions}`);

    const eligibleUsers = [];

    for (let user of allUsers) {
        // User ne pichle mahine kitne contribution kiye, woh gino
        const contributionsCount = await Contribution.countDocuments({
            user: user._id,
            date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
        });

        // Deactivation check waisa hi rahega
        const deactivationLog = await ActivityLog.findOne({
            user: user._id,
            activityType: 'deactivated',
            createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth }
        });

        // Naye niyam se eligibility check karo
        if (contributionsCount >= requiredContributions && !deactivationLog) {
            eligibleUsers.push(user);
        }
    }
    
    // Baaki ka function (profit baantna, save karna) bilkul waisa hi rahega...
    if (eligibleUsers.length === 0) {
        return { success: false, message: 'No users were eligible for last month\'s profit.' };
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
            message: `You have received ₹${share.toFixed(2)} from the profit distribution.`,
            link: '/profit',
        });
        await ProfitHistory.create({ user: user._id, amount: share });
    }
    
    const distributedAmount = profit.totalProfit;
    profit.totalProfit = 0;
    await profit.save();

    return { success: true, message: `Distributed total profit of ₹${distributedAmount.toFixed(2)} among ${eligibleUsers.length} eligible members.` };
};

module.exports = { distributeProfitForMonth };