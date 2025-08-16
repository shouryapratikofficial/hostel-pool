const Contribution = require('../models/Contribution');
const User = require('../models/User');
const PoolFund = require('../models/PoolFund');
const Dues = require('../models/Dues');
const AdminSetting = require('../models/AdminSetting');

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0:0);
    return new Date(d.setDate(diff));
};

const getContributionStatus = async (userId) => {
    const settings = await AdminSetting.findOne();
    const currentWeekAmount = settings ? settings.weeklyContributionAmount : 0;
    
    let totalDuesAmount = 0;
    const pendingDues = await Dues.find({ user: userId, status: 'pending' });

    if (pendingDues.length > 0) {
        totalDuesAmount = pendingDues.reduce((acc, due) => acc + due.amount, 0);
    }
    
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyContribution = await Contribution.findOne({
        user: userId,
        createdAt: { $gte: startOfWeek }
    });
    
    if (!weeklyContribution) {
        const finalAmountDue = totalDuesAmount + currentWeekAmount;
        if (finalAmountDue > 0) {
             return {
                isContributionDue: true,
                amountDue: finalAmountDue,
                message: `Pending Dues: ₹${totalDuesAmount} + Current Week: ₹${currentWeekAmount}`
            };
        }
    }
    
    return {
        isContributionDue: false,
        amountDue: 0,
        message: 'You are all caught up! Next contribution is due next week.'
    };
};

const addContribution = async (userId, amount) => {
    const user = await User.findById(userId);

    const pendingDues = await Dues.find({ user: user._id, status: 'pending' }).sort({ createdAt: 1 });
    
    for (const due of pendingDues) {
        if (amount >= due.amount) {
            amount -= due.amount;
            due.status = 'paid';
            await due.save();
        } else {
            throw new Error(`Insufficient amount to clear pending due of ₹${due.amount}. Please pay at least the due amount.`);
        }
    }

    const remainingDues = await Dues.countDocuments({ user: user._id, status: 'pending' });
    if (remainingDues === 0 && user.reservedProfit > 0) {
        user.balance += user.reservedProfit;
        user.reservedProfit = 0;
        await user.save();
    }

    if (amount > 0) {
        const contribution = await Contribution.create({ user: userId, amount });
        user.contributions += amount;
        await user.save();

        let poolFund = await PoolFund.findOne();
        if (!poolFund) {
            poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
        }
        poolFund.totalContributions += amount;
        await poolFund.save();
        
        return { message: 'Dues cleared and contribution added.', contribution };
    } else {
        return { message: 'All pending dues cleared successfully.' };
    }
};

const getCombinedHistory = async (userId) => {
    const contributions = await Contribution.find({ user: userId }).lean();
    const dues = await Dues.find({ user: userId }).lean();

    const timeline = contributions.map(c => ({
        _id: c._id,
        type: 'Contribution',
        amount: c.amount,
        status: 'Paid',
        date: c.createdAt
    })).concat(dues.map(d => ({
        _id: d._id,
        type: 'Due (Missed Payment)',
        amount: d.amount,
        status: d.status,
        date: d.createdAt
    })));

    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const getAllContributions = async () => {
    return await Contribution.find().populate('user', 'name email').sort({ date: -1 });
};

module.exports = {
    getContributionStatus,
    addContribution,
    getCombinedHistory,
    getAllContributions,
};