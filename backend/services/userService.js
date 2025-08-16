const User = require('../models/User');
const Loan = require('../models/Loan');
const PoolFund = require('../models/PoolFund');
const Dues = require('../models/Dues');
const AdminSetting = require('../models/AdminSetting');
const Withdrawal = require('../models/Withdrawal');
const ActivityLog = require('../models/ActivityLog');
const Profit = require('../models/Profit');

const getDashboardData = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }

    const pendingLoans = await Loan.find({
        borrower: userId,
        status: { $in: ['pending', 'approved'] }
    });

    const poolFund = await PoolFund.findOne();

    return {
        name: user.name,
        balance: user.balance || 0,
        pendingLoans,
        totalContributions: user.contributions || 0,
        poolTotalContributions: poolFund?.totalContributions || 0,
        poolBlockedAmount: poolFund?.blockedAmount || 0
    };
};

const withdrawUserBalance = async (userId, amount) => {
    if (!amount || amount <= 0) {
        throw new Error('Invalid withdrawal amount.');
    }

    const pendingDues = await Dues.findOne({ user: userId, status: 'pending' });
    if (pendingDues) {
        throw new Error('Please clear all your pending dues before withdrawing.');
    }

    const activeLoan = await Loan.findOne({ borrower: userId, status: 'approved' });
    if (activeLoan) {
        throw new Error('You have an active loan. Please repay it before withdrawing.');
    }

    const settings = await AdminSetting.findOne();
    if (!settings || amount < settings.minimumWithdrawalAmount) {
        throw new Error(`Minimum withdrawal amount is ₹${settings.minimumWithdrawalAmount}.`);
    }

    const user = await User.findById(userId);
    if (user.balance < amount) {
        throw new Error('Insufficient balance.');
    }

    user.balance -= amount;
    await user.save();

    await Withdrawal.create({ user: userId, amount: amount });

    return user;
};

// ... (Add other service functions here in subsequent steps)

// ... (Keep the existing getDashboardData and withdrawUserBalance functions)

// Helper function can be kept inside the service
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 0);
    return new Date(d.setDate(diff));
};

const deactivateUserAccount = async (userId) => {
    const pendingDues = await Dues.findOne({ user: userId, status: 'pending' });
    if (pendingDues) {
        throw new Error('Cannot deactivate account. Please clear all pending dues first.');
    }

    const activeLoan = await Loan.findOne({ borrower: userId, status: 'approved' });
    if (activeLoan) {
        throw new Error('Cannot deactivate account. You have an active loan that needs to be repaid.');
    }

    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const currentWeekContribution = await Contribution.findOne({
        user: userId,
        createdAt: { $gte: startOfWeek }
    });
    if (!currentWeekContribution) {
        throw new Error('Please make the contribution for the current week before deactivating your account.');
    }

    await Contribution.deleteOne({ user: userId, createdAt: { $gte: startOfWeek } });

    const user = await User.findById(userId);
    const totalContributions = user.contributions || 0;
    const accountBalance = user.balance || 0;
    const totalReturnAmount = totalContributions + accountBalance;

    const poolFund = await PoolFund.findOne();
    if (poolFund) {
        poolFund.totalContributions -= totalContributions;
        await poolFund.save();
    }

    user.contributions = 0;
    user.balance = 0;
    user.isActive = false;
    await user.save();
    
    await ActivityLog.create({ user: userId, activityType: 'deactivated' });

    return { message: 'Your account has been successfully deactivated. You will be logged out.', returnedAmount: totalReturnAmount };
};

const getAdminStats = async () => {
    const poolFund = await PoolFund.findOne();
    const profit = await Profit.findOne();
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();

    const totalAvailableBalance = (poolFund?.totalContributions || 0) - (poolFund?.blockedAmount || 0);
    const totalBalance = (poolFund?.totalContributions || 0);

    const monthlyProfit = await Loan.aggregate([
        { $match: { status: 'repaid' } },
        { $group: { _id: { month: { $month: '$repaidAt' }, year: { $year: '$repaidAt' } }, totalInterest: { $sum: '$interest' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $project: { _id: 0, month: '$_id.month', profit: '$totalInterest' } }
    ]);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const profitTrend = monthlyProfit.map(p => ({ month: monthNames[p.month - 1], profit: p.profit }));

    return {
      totalAvailableBalance,
      totalBalance,
      blockedAmount: poolFund?.blockedAmount || 0,
      profitPool: profit?.totalProfit || 0,
      totalUsers,
      totalLoans,
      profitTrend
    };
};

const getAllUsersData = async () => {
    return await User.find().select('-password');
};

const getSettings = async () => {
    let settings = await AdminSetting.findOne();
    if (!settings) {
        settings = await new AdminSetting().save();
    }
    return settings;
};

const updateSettings = async (settingsData) => {
    const { weeklyContributionAmount, lateFineAmount, minimumWithdrawalAmount, loanInterestRate } = settingsData;
    const updatedSettings = await AdminSetting.findOneAndUpdate(
        {},
        { $set: { weeklyContributionAmount, lateFineAmount, minimumWithdrawalAmount, loanInterestRate } },
        { new: true, upsert: true, runValidators: true }
    );
    return updatedSettings;
};

// Update the module.exports at the bottom of the file
module.exports = {
    getDashboardData,
    withdrawUserBalance,
    deactivateUserAccount,
    getAdminStats,
    getAllUsersData,
    getSettings,
    updateSettings
};