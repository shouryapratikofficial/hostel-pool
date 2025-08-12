const Contribution = require('../models/Contribution');
const User = require('../models/User');
const PoolFund = require('../models/PoolFund');
// Add a weekly contribution
exports.addContribution = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create contribution record
    const contribution = await Contribution.create({
      user: req.user._id,
      amount
    });

    // Update user's total contributions
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { contributions: amount }
    });

    
    // Update PoolFund totalContributions
    let poolFund = await PoolFund.findOne();
    if (!poolFund) {
      poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
    }
    poolFund.totalContributions += amount;
    await poolFund.save();


    res.status(201).json({ message: 'Contribution added', contribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all contributions (admin only)
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate('user', 'name email')
      .sort({ date: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's contributions
exports.getMyContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user._id }).sort({ date: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
