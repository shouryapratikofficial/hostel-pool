const Profit = require('../models/Profit');
const ProfitHistory = require('../models/ProfitHistory');
const Withdrawal = require('../models/Withdrawal'); // Withdrawal model 
const { distributeProfitForMonth } = require('../utils/profitHelper');

// backend/controllers/profitController.js
exports.getProfitHistory = async (req, res) => {
  try {
    const history = await ProfitHistory.find({ user: req.user._id }).sort({ distributionDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New function to get the profit status
exports.getProfitStatus = async (req, res) => {
  try {
    const profit = await Profit.findOne();
    res.json({ totalProfit: profit?.totalProfit || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.distributeProfitNow = async (req, res) => {
  try {
    const today = new Date();
    const result = await distributeProfitForMonth(today);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const profits = await ProfitHistory.find({ user: userId }).lean();
    const withdrawals = await Withdrawal.find({ user: userId }).lean();

    const history = [];

    profits.forEach(p => {
      history.push({
        _id: p._id,
        type: 'Profit',
        amount: p.amount,
        date: p.distributionDate,
        transactionType: 'credit' // Jama hua
      });
    });

    withdrawals.forEach(w => {
      history.push({
        _id: w._id,
        type: 'Withdrawal',
        amount: w.amount,
        date: w.date,
        transactionType: 'debit' // Nikala gaya
      });
    });

    // History ko date ke hisaab se sort karein, sabse naya upar
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};