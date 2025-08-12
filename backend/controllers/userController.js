const PoolFund = require('../models/PoolFund');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');
const Profit = require('../models/Profit');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pendingLoans = await Loan.find({
      borrower: req.user._id,
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    const poolFund = await PoolFund.findOne();
    const profit = await Profit.findOne();

    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();

    const totalAvailableBalance = (poolFund?.totalContributions || 0) - (poolFund?.blockedAmount || 0);
    const totalBalance = (poolFund?.totalContributions || 0);

    // Dynamic profit trend data fetch kar rahe hain
    const monthlyProfit = await Loan.aggregate([
      { $match: { status: 'repaid' } },
      {
        $group: {
          _id: {
            month: { $month: '$repaidAt' },
            year: { $year: '$repaidAt' }
          },
          totalInterest: { $sum: '$interest' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          profit: '$totalInterest'
        }
      }
    ]);
    
    // Monthly numbers ko month names mein convert karna
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const profitTrend = monthlyProfit.map(p => ({
      month: monthNames[p.month - 1],
      profit: p.profit
    }));

    res.json({
      totalAvailableBalance,
      totalBalance,
      blockedAmount: poolFund?.blockedAmount || 0,
      profitPool: profit?.totalProfit || 0,
      totalUsers,
      totalLoans,
      profitTrend
    });
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error.message);
    res.status(500).json({ message: "An error occurred on the server." });
  }
};