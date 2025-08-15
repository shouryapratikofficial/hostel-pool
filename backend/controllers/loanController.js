const Loan = require('../models/Loan');
const Profit = require('../models/Profit');
const PoolFund = require('../models/PoolFund');  // Import PoolFund model
const Notification = require('../models/Notification');
const AdminSetting = require('../models/AdminSetting'); // 

// User requests a loan
exports.requestLoan = async (req, res) => {
  try {
    const { amount, purpose } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Loan amount must be greater than 0' });
    }

    const loan = await Loan.create({
      borrower: req.user._id,
      amount,
      purpose,
      status: 'pending'
    });

    res.status(201).json({ message: 'Loan request submitted', loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves a loan

exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status !== 'pending') return res.status(400).json({ message: 'Loan is not pending' });

    // Fetch the pool fund doc (assume single doc)
    let poolFund = await PoolFund.findOne();
    if (!poolFund) {
      // If no doc exists, create one with default zero values
      poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
      await poolFund.save();
    }

    const availableFund = poolFund.totalContributions - poolFund.blockedAmount;

   if (loan.amount > availableFund) {
  loan.status = 'rejected';
  loan.rejectedAt = new Date();
  await loan.save();

  return res.status(400).json({ message: 'Loan amount exceeds available pool fund' });
}


    // Approve loan and block fund
    loan.status = 'approved';
    loan.approvedAt = new Date();
    await loan.save();

    poolFund.blockedAmount += loan.amount;
    await poolFund.save();

    // NEW: Create a notification for the borrower
    await Notification.create({
      user: loan.borrower,
      message: `Your loan request for ₹${loan.amount} has been approved.`,
      link: '/loans',
    });

    res.json({ message: 'Loan approved successfully', loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending loans can be rejected' });
    }

    loan.status = 'rejected';
    loan.rejectedAt = new Date();
    await loan.save();

     // NEW: Create a notification for the borrower
    await Notification.create({
      user: loan.borrower,
      message: `Your loan request for ₹${loan.amount} has been rejected.`,
      link: '/loans',
    });

    res.json({ message: 'Loan rejected successfully', loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User repays a loan


exports.repayLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status !== 'approved') return res.status(400).json({ message: 'Loan is not active' });

    const settings = await AdminSetting.findOne(); // Settings fetch karein
    const interestRate = (settings.loanInterestRate || 5) / 100; // Database se rate lein


    // --- NAYA INTEREST CALCULATION LOGIC ---
    const approvedDate = new Date(loan.approvedAt);
    const repaymentDate = new Date();
    
    // Mahino ka antar calculate karein
    const monthsPassed = (repaymentDate.getFullYear() - approvedDate.getFullYear()) * 12 + (repaymentDate.getMonth() - approvedDate.getMonth());
    
    // Kam se kam ek mahine ka interest lagega, bhale hi kuchh din mein repay kar dein
    const loanDurationInMonths = Math.max(1, monthsPassed);

    // 5% mahine ka sadharan byaaj
    const interest = loan.amount * interestRate * loanDurationInMonths;
    const totalRepaymentAmount = loan.amount + interest;
    // --- END OF NEW LOGIC ---

    loan.status = 'repaid';
    loan.repaidAt = repaymentDate;
    loan.interest = interest; // Naya calculated interest
    loan.repaidAmount = totalRepaymentAmount; // Nayi total rakam
    await loan.save();

    // PoolFund aur Profit ko update karna waise hi rahega
    let poolFund = await PoolFund.findOne();
    if (!poolFund) poolFund = new PoolFund({ totalContributions: 0, blockedAmount: 0 });
    poolFund.blockedAmount -= loan.amount;
    await poolFund.save();

    let profit = await Profit.findOne();
    if (!profit) profit = new Profit({ totalProfit: 0 });
    profit.totalProfit += interest;
    await profit.save();

    res.json({
      message: `Loan of ₹${loan.amount} repaid successfully with an interest of ₹${interest}. Total amount paid: ₹${totalRepaymentAmount}.`,
      loan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get loans of logged in user (optional)
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.user._id }).sort({ requestedAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('borrower', 'name email').sort({ requestedAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getRepaymentDetails = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan || loan.status !== 'approved') {
      return res.status(404).json({ message: 'Active loan not found.' });
    }
    const settings = await AdminSetting.findOne(); // Settings fetch karein
    const interestRate = (settings.loanInterestRate || 5) / 100; // Database se rate lein, ya default 5%
    const approvedDate = new Date(loan.approvedAt);
    const today = new Date();
    const monthsPassed = (today.getFullYear() - approvedDate.getFullYear()) * 12 + (today.getMonth() - approvedDate.getMonth());
    const loanDurationInMonths = Math.max(1, monthsPassed);
    const interest = loan.amount * interestRate * loanDurationInMonths;
    const totalRepaymentAmount = loan.amount + interest;

    res.json({
      principal: loan.amount,
      interest: interest.toFixed(2),
      total: totalRepaymentAmount.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};