const PoolFund = require('../models/PoolFund');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');
const Profit = require('../models/Profit');
const AdminSetting = require('../models/AdminSetting'); // new
const Dues = require('../models/Dues');
const Withdrawal = require('../models/Withdrawal'); // Naya model 
const ActivityLog = require('../models/ActivityLog'); // 


const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0:0);
    return new Date(d.setDate(diff));
};

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pendingLoans = await Loan.find({
      borrower: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });



     // Get pool fund info
    const poolFund = await PoolFund.findOne();

    res.json({
      name: user.name,
      balance: user.balance || 0,
      pendingLoans,
      totalContributions: user.contributions || 0,
      poolTotalContributions: poolFund?.totalContributions || 0,
      poolBlockedAmount: poolFund?.blockedAmount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminSettings = async (req, res) => {
  try {
    // findOne() hamesha ek document dega, ya null agar nahi hai
    let settings = await AdminSetting.findOne();
    if (!settings) {
      // Agar koi setting nahi hai, to ek default setting banakar save kar dein
      settings = await new AdminSetting().save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching settings.' });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const { weeklyContributionAmount, lateFineAmount ,minimumWithdrawalAmount ,loanInterestRate  } = req.body;

    // findOneAndUpdate with upsert:true
    // Agar settings hain to update karega, nahi to naya bana dega.
    const updatedSettings = await AdminSetting.findOneAndUpdate(
      {}, // Khali filter pehla document match karega
      { $set: { weeklyContributionAmount, lateFineAmount , minimumWithdrawalAmount , loanInterestRate   } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating settings.' });
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

exports.withdrawBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount.' });
    }

    // 1. User ke pending dues check karein
    const pendingDues = await Dues.findOne({ user: userId, status: 'pending' });
    if (pendingDues) {
      return res.status(403).json({ message: 'Please clear all your pending dues before withdrawing.' });
    }

    // 2. User ka active loan check karein
    const activeLoan = await Loan.findOne({ borrower: userId, status: 'approved' });
    if (activeLoan) {
      return res.status(403).json({ message: 'You have an active loan. Please repay it before withdrawing.' });
    }

    // 3. Admin settings se minimum withdrawal amount lein
    const settings = await AdminSetting.findOne();
    if (amount < settings.minimumWithdrawalAmount) {
      return res.status(400).json({ message: `Minimum withdrawal amount is ₹${settings.minimumWithdrawalAmount}.` });
    }

    // 4. User ka balance check karein
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Sab theek hai, to balance se amount kam karein
    user.balance -= amount;
    await user.save();

     await Withdrawal.create({
      user: userId,
      amount: amount,
    });

    res.json({ message: `Successfully withdrew ₹${amount}. Your new balance is ₹${user.balance}.` });

  } catch (error) {
    console.error('Error during withdrawal:', error);
    res.status(500).json({ message: 'Server error during withdrawal.' });
  }
};

exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check for pending dues
    const pendingDues = await Dues.findOne({ user: userId, status: 'pending' });
    if (pendingDues) {
      return res.status(403).json({ message: 'Cannot deactivate account. Please clear all pending dues first.' });
    }

    // 2. Check for active loans
    const activeLoan = await Loan.findOne({ borrower: userId, status: 'approved' });
    if (activeLoan) {
      return res.status(403).json({ message: 'Cannot deactivate account. You have an active loan that needs to be repaid.' });
    }

    // Deactivate the user
    const user = await User.findById(userId);

       // Calculate total return amount
     const totalContributions = user.contributions || 0;
    const accountBalance = user.balance || 0;
    const totalReturnAmount = totalContributions + accountBalance;


// hostel pool fund ko kam kr


    const poolFund = await PoolFund.findOne();
    if (poolFund) {
      poolFund.totalContributions -= totalContributions;
     
      await poolFund.save();
    }

    // Reset user's funds
    user.contributions = 0;
    user.balance = 0;

    // Deactivate user

    user.isActive = false;
    await user.save();
    await ActivityLog.create({ user: userId, activityType: 'deactivated' });

    res.json({ message: 'Your account has been successfully deactivated. You will be logged out.' ,  returnedAmount: totalReturnAmount });

  } catch (error) {
    console.error('Error during account deactivation:', error);
    res.status(500).json({ message: 'Server error during account deactivation.' });
  }
};