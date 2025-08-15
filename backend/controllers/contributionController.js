



const Contribution = require('../models/Contribution');
const User = require('../models/User');
const PoolFund = require('../models/PoolFund');
const Dues = require('../models/Dues'); // Dues model import karein
const AdminSetting = require('../models/AdminSetting'); // Isse import karna zaroori hai


// Helper function to get the start of the current week (Sunday)
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0:0); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

exports.getContributionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const settings = await AdminSetting.findOne();
        const currentWeekAmount = settings ? settings.weeklyContributionAmount : 0;
        
        let totalDuesAmount = 0;
        const pendingDues = await Dues.find({ user: userId, status: 'pending' });

        if (pendingDues.length > 0) {
            pendingDues.forEach(due => {
                totalDuesAmount += due.amount;
            });
        }
        
        const today = new Date();
        const startOfWeek = getStartOfWeek(today);
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyContribution = await Contribution.findOne({
            user: userId,
            createdAt: { $gte: startOfWeek }
        });
        
        // Agar is hafte ka payment nahi hua hai, to total due mein current week ka amount jodo
        if (!weeklyContribution) {
            const finalAmountDue = totalDuesAmount + currentWeekAmount;
            
            if (finalAmountDue > 0) {
                 return res.json({
                    isContributionDue: true,
                    amountDue: finalAmountDue,
                    message: `Pending Dues: ₹${totalDuesAmount} + Current Week: ₹${currentWeekAmount}`
                });
            }
        }
        
        // Agar koi due nahi hai aur is hafte ka payment ho chuka hai
        return res.json({
            isContributionDue: false,
            amountDue: 0,
            message: 'You are all caught up! Next contribution is due next week.'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching contribution status.' });
    }
};

// Add a weekly contribution
exports.addContribution = async (req, res) => {
  try {
    let { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Check for pending dues and pay them first
    const pendingDues = await Dues.find({ user: user._id, status: 'pending' }).sort({ createdAt: 1 });
    
    for (const due of pendingDues) {
      if (amount >= due.amount) {
        amount -= due.amount;
        due.status = 'paid';
        await due.save();
        console.log(`Paid due of ₹${due.amount} for user ${user.name}`);
      } else {
        // Agar paisa kam hai to message dekar process rok dein
        return res.status(400).json({ message: `Insufficient amount to clear pending due of ₹${due.amount}. Please pay at least the due amount.` });
      }
    }

    // Dues clear hone ke baad, check karein ki koi reserved profit hai ya nahi
    const remainingDues = await Dues.countDocuments({ user: user._id, status: 'pending' });
    if (remainingDues === 0 && user.reservedProfit > 0) {
      console.log(`All dues cleared. Transferring reserved profit of ₹${user.reservedProfit} to main balance for ${user.name}.`);
      user.balance += user.reservedProfit;
      user.reservedProfit = 0;
      await user.save(); // User ko save karna zaroori hai
    }

    // Bacha hua amount contribution mein add hoga
    if (amount > 0) {
        const contribution = await Contribution.create({
          user: req.user._id,
          amount
        });
        
        user.contributions += amount;
        await user.save(); // Save user again for contribution update

        // Update PoolFund totalContributions
        let poolFund = await PoolFund.findOne();
        if (!poolFund) {
            poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
        }
        poolFund.totalContributions += amount;
        await poolFund.save();
        
        return res.status(201).json({ message: 'Dues cleared and contribution added.', contribution });
    } else {
        return res.status(200).json({ message: 'All pending dues cleared successfully.' });
    }

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

exports.getCombinedHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch all contributions
        const contributions = await Contribution.find({ user: userId }).lean(); // .lean() for plain JS objects

        // 2. Fetch all dues (paid and pending)
        const dues = await Dues.find({ user: userId }).lean();

        // 3. Format and merge them into a single timeline
        const timeline = [];

        contributions.forEach(c => {
            timeline.push({
                _id: c._id,
                type: 'Contribution',
                amount: c.amount,
                status: 'Paid',
                date: c.createdAt // Use createdAt for consistent sorting
            });
        });

        dues.forEach(d => {
            timeline.push({
                _id: d._id,
                type: 'Due (Missed Payment)',
                amount: d.amount,
                status: d.status, // 'pending' or 'paid'
                date: d.createdAt
            });
        });

        // 4. Sort the combined timeline by date, most recent first
        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(timeline);

    } catch (error) {
        console.error('Error fetching combined history:', error);
        res.status(500).json({ message: 'Server error while fetching history.' });
    }
};