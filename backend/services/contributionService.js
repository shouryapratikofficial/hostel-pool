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
 * Helper function to convert a week identifier (e.g., "2025-W33") back to a Date object.
 * This will give us the date of the Monday of that week.
 * @param {string} weekIdentifier - The identifier for the week.
 * @returns {Date} The date corresponding to the start of that week.
 */
const getDateFromWeekIdentifier = (weekIdentifier) => {
    const [year, week] = weekIdentifier.split('-W').map(Number);
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const isoWeekStart = simple;
    if (dayOfWeek <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return isoWeekStart;
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
        const accurateContributionDate = getDateFromWeekIdentifier(due.weekIdentifier);

         await Contribution.create({
            user: userId,
            amount: missedContribution,
            date: accurateContributionDate,   // Back-dating the contribution
           
        });
        
        // User ka lifetime contribution update karo
        user.contributions += missedContribution;
        poolFund.totalContributions += missedContribution;
        profit.totalProfit += lateFineAmount;
    }
    
    // Process the current week's contribution if it was due
    if (!weeklyContribution) {
        await Contribution.create({ user: userId, amount: weeklyContributionAmount  });
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
 * Fetches a complete and transparent history of all transactions for a user.
 * It shows all contributions and all dues (both pending and paid).
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A sorted array of all transactions.
 */
const getCombinedHistory = async (userId) => {
    // 1. Saare contributions uthao
    const contributions = await Contribution.find({ user: userId }).lean();

    // 2. Saare dues uthao (chahe pending ho ya paid)
    const allDues = await Dues.find({ user: userId }).lean();

    // Contributions ko display ke liye format karo
    const contributionsTimeline = contributions.map(c => {
        // Pata lagao ki yeh ek regular contribution hai ya back-dated (due se bana hua)
        const contributionDate = new Date(c.date);
        const createdDate = new Date(c.createdAt);
        // Agar dono dates mein 1 din se zyada ka fark hai, toh yeh late payment tha
        const isLatePayment = (createdDate.getTime() - contributionDate.getTime()) > (24 * 60 * 60 * 1000);

        return {
            _id: c._id,
            // Type ko aur descriptive banao
            type: isLatePayment ? 'Contribution (Paid Late)' : 'Contribution (On Time)',
            amount: c.amount,
            status: 'Paid',
            date: c.date 
        };
    });

    // Dues ko display ke liye format karo
    const duesTimeline = allDues.map(d => ({
        _id: d._id,
        type: 'Fine Incurred', // Isse saaf pata chalega ki yeh fine laga tha
        amount: d.amount,
        status: d.status,
        date: d.createdAt
    }));

    // Dono lists ko jodo aur date ke hisaab se sort kar do
    const timeline = [...contributionsTimeline, ...duesTimeline];

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