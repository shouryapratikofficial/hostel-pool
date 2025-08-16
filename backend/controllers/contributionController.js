const asyncHandler = require('express-async-handler');
const contributionService = require('../services/contributionService');

exports.getContributionStatus = asyncHandler(async (req, res) => {
    const status = await contributionService.getContributionStatus(req.user._id);
    res.json(status);
});

exports.addContribution = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const result = await contributionService.addContribution(req.user._id, amount);
    const statusCode = result.contribution ? 201 : 200;
    res.status(statusCode).json(result);
});

exports.getCombinedHistory = asyncHandler(async (req, res) => {
    const history = await contributionService.getCombinedHistory(req.user._id);
    res.json(history);
});

exports.getAllContributions = asyncHandler(async (req, res) => {
    const contributions = await contributionService.getAllContributions();
    res.json(contributions);
});