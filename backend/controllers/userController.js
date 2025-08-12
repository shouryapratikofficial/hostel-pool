const PoolFund = require('../models/PoolFund');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    const pendingLoans = await Loan.find({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    const totalContributions = await Contribution.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

     // Get pool fund info
    const poolFund = await PoolFund.findOne();

    res.json({
      name: user.name,
      balance: user.balance || 0,
      pendingLoans,
      totalContributions: totalContributions[0]?.total || 0,
       poolTotalContributions: poolFund?.totalContributions || 0,
      poolBlockedAmount: poolFund?.blockedAmount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
