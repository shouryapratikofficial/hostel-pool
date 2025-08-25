const Contribution = require('../models/Contribution');
const User = require('../models/User');
const PoolFund = require('../models/PoolFund');
const Dues = require('../models/Dues');
const AdminSetting = require('../models/AdminSetting');
const Profit = require('../models/Profit'); // Profit model ko import karna zaroori hai

/**
 * Helper function to get the start of the week.
 * Assumes the week starts on Sunday (day 0).
 * @param {Date} date - The date to get the start of the week for.
 * @returns {Date} The date of the Sunday for that week.
 */
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday = 0, Monday = 1, etc.
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

/**
 * Calculates the user's current contribution status, including all pending dues
 * and the current week's contribution if it hasn't been paid.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} An object with the contribution status.
 */
const getContributionStatus = async (userId) => {
    const settings = await AdminSetting.findOne();
    if (!settings) {
        return { isContributionDue: false, amountDue: 0, message: "System settings are not configured. Please contact admin." };
    }
    const weeklyContributionAmount = settings.weeklyContributionAmount;

    // Calculate the total amount from all pending dues
    const pendingDues = await Dues.find({ user: userId, status: 'pending' });
    const totalDuesAmount = pendingDues.reduce((acc, due) => acc + due.amount, 0);
    
    // Check if the current week's contribution has already been made
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyContribution = await Contribution.findOne({
        user: userId,
        createdAt: { $gte: startOfWeek }
    });
    
    // The amount due for the current week is the full weekly amount only if it hasn't been paid
    const currentWeekDueAmount = weeklyContribution ? 0 : weeklyContributionAmount;
    const totalRequiredAmount = totalDuesAmount + currentWeekDueAmount;
    
    if (totalRequiredAmount > 0) {
        return {
           isContributionDue: true,
           amountDue: totalRequiredAmount,
           message: `Pending Dues: ₹${totalDuesAmount} + Current Week: ₹${currentWeekDueAmount}`
       };
   }
    
    return {
        isContributionDue: false,
        amountDue: 0,
        message: 'You are all caught up! Next contribution is due next week.'
    };
};

/**
 * Processes a user's contribution payment using a strict "All or Nothing" rule.
 * The submitted amount must exactly match the total required amount.
 * It correctly routes missed contributions and fines to the PoolFund and Profit collections.
 * @param {string} userId - The ID of the user making the payment.
 * @param {number} submittedAmount - The exact amount submitted by the user.
 * @returns {Promise<object>} A success message object.
 */
const addContribution = async (userId, submittedAmount) => {
    // Step 1: Fetch all necessary data and calculate the required amount
    const settings = await AdminSetting.findOne();
    if (!settings) throw new Error('Admin settings are not configured.');
    
    const { weeklyContributionAmount, lateFineAmount } = settings;
    const user = await User.findById(userId);

    const pendingDues = await Dues.find({ user: user._id, status: 'pending' });
    const totalDuesAmount = pendingDues.reduce((sum, due) => sum + due.amount, 0);

    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyContribution = await Contribution.findOne({ user: userId, createdAt: { $gte: startOfWeek } });
    
    const currentWeekDueAmount = weeklyContribution ? 0 : weeklyContributionAmount;
    const totalRequiredAmount = totalDuesAmount + currentWeekDueAmount;

    // Step 2: Enforce the "All or Nothing" rule
    if (totalRequiredAmount === 0) {
        throw new Error("You have no pending dues or contributions to pay.");
    }

    if (submittedAmount !== totalRequiredAmount) {
        throw new Error(`Invalid amount submitted. Please pay the exact total of ₹${totalRequiredAmount}.`);
    }

    // Step 3: If the amount is correct, process all transactions
    let poolFund = await PoolFund.findOne() || new PoolFund();
    let profit = await Profit.findOne() || new Profit();

    // Mark dues as paid and distribute the funds correctly
    for (const due of pendingDues) {
        due.status = 'paid';
        await due.save();
        
        const missedContribution = due.amount - lateFineAmount;
        poolFund.totalContributions += missedContribution;
        profit.totalProfit += lateFineAmount;
    }
    
    // Process the current week's contribution if it was due
    if (!weeklyContribution) {
        await Contribution.create({ user: userId, amount: weeklyContributionAmount });
        user.contributions += weeklyContributionAmount;
        poolFund.totalContributions += weeklyContributionAmount;
    }
    
    // Save all changes to the database
    await poolFund.save();
    await profit.save();
    
    // Release any reserved profit
    if (user.reservedProfit > 0) {
        user.balance += user.reservedProfit;
        user.reservedProfit = 0;
    }
    await user.save();

    return { message: `Payment of ₹${totalRequiredAmount} successful. All dues and contributions are up to date.` };
};

/**
 * Fetches a combined history of contributions and dues for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A sorted array of transactions.
 */
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

/**
 * Fetches all contributions for all users (Admin only).
 * @returns {Promise<Array<object>>} A list of all contributions.
 */
const getAllContributions = async () => {
    return await Contribution.find().populate('user', 'name email').sort({ date: -1 });
};

module.exports = {
    getContributionStatus,
    addContribution,
    getCombinedHistory,
    getAllContributions,
};