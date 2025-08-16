const Profit = require('../models/Profit');
const ProfitHistory = require('../models/ProfitHistory');
const Withdrawal = require('../models/Withdrawal');
const { distributeProfitForMonth } = require('../utils/profitHelper');

const getProfitStatus = async () => {
    const profit = await Profit.findOne();
    return { totalProfit: profit?.totalProfit || 0 };
};

const distributeProfit = async () => {
    const today = new Date();
    return await distributeProfitForMonth(today);
};

const getTransactionHistory = async (userId) => {
    const profits = await ProfitHistory.find({ user: userId }).lean();
    const withdrawals = await Withdrawal.find({ user: userId }).lean();

    const history = profits.map(p => ({
        _id: p._id,
        type: 'Profit',
        amount: p.amount,
        date: p.distributionDate,
        transactionType: 'credit'
    })).concat(withdrawals.map(w => ({
        _id: w._id,
        type: 'Withdrawal',
        amount: w.amount,
        date: w.date,
        transactionType: 'debit'
    })));

    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};


module.exports = {
    getProfitStatus,
    distributeProfit,
    getTransactionHistory
};