const asyncHandler = require('express-async-handler');
const loanService = require('../services/loanService');

exports.requestLoan = asyncHandler(async (req, res) => {
    const { amount, purpose } = req.body;
    const loan = await loanService.requestLoan(req.user._id, amount, purpose);
    res.status(201).json({ message: 'Loan request submitted', loan });
});

exports.approveLoan = asyncHandler(async (req, res) => {
    const loan = await loanService.approveLoan(req.params.id);
    res.json({ message: 'Loan approved successfully', loan });
});

exports.rejectLoan = asyncHandler(async (req, res) => {
    const loan = await loanService.rejectLoan(req.params.id);
    res.json({ message: 'Loan rejected successfully', loan });
});

exports.repayLoan = asyncHandler(async (req, res) => {
    const loan = await loanService.repayLoan(req.params.id);
    res.json({ message: `Loan of ₹${loan.amount} repaid successfully with an interest of ₹${loan.interest.toFixed(2)}. Total amount paid: ₹${loan.repaidAmount.toFixed(2)}.`, loan });
});

exports.getMyLoans = asyncHandler(async (req, res) => {
    const loans = await loanService.getMyLoans(req.user._id);
    res.json(loans);
});

exports.getAllLoans = asyncHandler(async (req, res) => {
    const loans = await loanService.getAllLoans();
    res.json(loans);
});

exports.getRepaymentDetails = asyncHandler(async (req, res) => {
    const details = await loanService.getRepaymentDetails(req.params.id);
    res.json(details);
});