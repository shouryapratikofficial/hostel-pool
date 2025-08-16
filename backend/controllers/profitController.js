const asyncHandler = require('express-async-handler');
const profitService = require('../services/profitService');

exports.getProfitStatus = asyncHandler(async (req, res) => {
    const status = await profitService.getProfitStatus();
    res.json(status);
});

exports.distributeProfitNow = asyncHandler(async (req, res) => {
    const result = await profitService.distributeProfit();
    if (result.success) {
        res.json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

exports.getTransactionHistory = asyncHandler(async (req, res) => {
    const history = await profitService.getTransactionHistory(req.user._id);
    res.json(history);
});