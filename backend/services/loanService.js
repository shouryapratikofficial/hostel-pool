const Loan = require('../models/Loan');
const PoolFund = require('../models/PoolFund');
const Notification = require('../models/Notification');
const AdminSetting = require('../models/AdminSetting');
const Profit = require('../models/Profit');

const requestLoan = async (userId, amount, purpose) => {
    return await Loan.create({ borrower: userId, amount, purpose, status: 'pending' });
};

const approveLoan = async (loanId) => {
    const loan = await Loan.findById(loanId).populate('borrower');
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'pending') throw new Error('Loan is not pending');
    if (!loan.borrower || !loan.borrower.isActive) {
        loan.status = 'rejected';
        await loan.save();
        throw new Error('Cannot approve loan. The user is inactive.');
    }

    let poolFund = await PoolFund.findOne();
    if (!poolFund) {
        poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
    }

    const availableFund = poolFund.totalContributions - poolFund.blockedAmount;
    if (loan.amount > availableFund) {
        loan.status = 'rejected';
        loan.rejectedAt = new Date();
        await loan.save();
        throw new Error('Loan amount exceeds available pool fund');
    }

    const settings = await AdminSetting.findOne();
    if (!settings) throw new Error('Admin settings not found.');

    loan.status = 'approved';
    loan.approvedAt = new Date();
    loan.interestRate = settings.loanInterestRate;
    await loan.save();

    poolFund.blockedAmount += loan.amount;
    await poolFund.save();

    await Notification.create({
        user: loan.borrower._id,
        message: `Your loan request for ₹${loan.amount} has been approved.`,
        link: '/loans',
    });

    return loan;
};

const rejectLoan = async (loanId) => {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'pending') throw new Error('Only pending loans can be rejected');

    loan.status = 'rejected';
    loan.rejectedAt = new Date();
    await loan.save();

    await Notification.create({
        user: loan.borrower,
        message: `Your loan request for ₹${loan.amount} has been rejected.`,
        link: '/loans',
    });

    return loan;
};

const repayLoan = async (loanId) => {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'approved') throw new Error('Loan is not active');

    const interestRate = (loan.interestRate || 5) / 100;
    const approvedDate = new Date(loan.approvedAt);
    const repaymentDate = new Date();
    
    const monthsPassed = (repaymentDate.getFullYear() - approvedDate.getFullYear()) * 12 + (repaymentDate.getMonth() - approvedDate.getMonth());
    const loanDurationInMonths = Math.max(1, monthsPassed);

    const interest = loan.amount * interestRate * loanDurationInMonths;
    const totalRepaymentAmount = loan.amount + interest;

    loan.status = 'repaid';
    loan.repaidAt = repaymentDate;
    loan.interest = interest;
    loan.repaidAmount = totalRepaymentAmount;
    await loan.save();

    let poolFund = await PoolFund.findOne();
    if (!poolFund) poolFund = new PoolFund();
    poolFund.blockedAmount -= loan.amount;
    await poolFund.save();

    let profit = await Profit.findOne();
    if (!profit) profit = new Profit();
    profit.totalProfit += interest;
    await profit.save();

    return loan;
};

const getMyLoans = async (userId) => {
    return await Loan.find({ borrower: userId }).sort({ requestedAt: -1 });
};

const getAllLoans = async () => {
    return await Loan.find().populate('borrower', 'name email').sort({ requestedAt: -1 });
};

const getRepaymentDetails = async (loanId) => {
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== 'approved') throw new Error('Active loan not found.');

    const interestRate = (loan.interestRate || 5) / 100;
    const approvedDate = new Date(loan.approvedAt);
    const today = new Date();
    const monthsPassed = (today.getFullYear() - approvedDate.getFullYear()) * 12 + (today.getMonth() - approvedDate.getMonth());
    const loanDurationInMonths = Math.max(1, monthsPassed);
    const interest = loan.amount * interestRate * loanDurationInMonths;
    const totalRepaymentAmount = loan.amount + interest;

    return {
        principal: loan.amount,
        interest: interest.toFixed(2),
        total: totalRepaymentAmount.toFixed(2),
    };
};


module.exports = {
    requestLoan,
    approveLoan,
    rejectLoan,
    repayLoan,
    getMyLoans,
    getAllLoans,
    getRepaymentDetails
};