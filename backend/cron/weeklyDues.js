const cron = require('node-cron');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const AdminSetting = require('../models/AdminSetting');
const Dues = require('../models/Dues');

// Function to get the ISO week number for a date
const getWeekIdentifier = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};


const checkWeeklyContributions = async () => {
  console.log('Running weekly contribution check...');
  try {
    const settings = await AdminSetting.findOne();
    if (!settings) {
      console.log('Admin settings not found. Skipping dues check.');
      return;
    }

    const today = new Date();
    // Pichle hafte ka check karenge to avoid timing issues
    const lastWeek = new Date(today.setDate(today.getDate() - 7)); 
    const weekIdentifier = getWeekIdentifier(lastWeek);

    const startOfWeek = new Date(lastWeek);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7); // Last Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Last Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const activeUsers = await User.find({ role: 'member' }); // isActive: true baad mein add karenge

    for (const user of activeUsers) {
      // Check if due for this week already exists
      const existingDue = await Dues.findOne({ user: user._id, weekIdentifier });
      if (existingDue) {
        continue; // Pehle se due hai, to skip karo
      }

      // Check for contribution in the last week
      const contribution = await Contribution.findOne({
        user: user._id,
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      });

      if (!contribution) {
        // Contribution nahi mila, to due banayein
        console.log(`No contribution found for user ${user.name} for week ${weekIdentifier}. Creating a due.`);
        
        const dueAmount = settings.weeklyContributionAmount + settings.lateFineAmount;
        
        await Dues.create({
          user: user._id,
          amount: dueAmount,
          reason: `Missed contribution for week ${weekIdentifier}`,
          weekIdentifier: weekIdentifier,
        });
      }
    }
  } catch (error) {
    console.error('Error during weekly contribution check:', error);
  }
};

// Yeh cron job har Somvaar subah 1 baje chalega
// It will check for the *previous* week's contributions.
cron.schedule('0 1 * * 1', checkWeeklyContributions);

console.log('✅ Weekly dues cron job scheduled.');

module.exports = { checkWeeklyContributions }; // Export for testing