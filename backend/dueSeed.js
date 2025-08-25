const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Dues = require('./models/Dues');
const AdminSetting = require('./models/AdminSetting');

dotenv.config();

// --- CONFIGURATION ---
// Yahaan us user ka email daalo jiske liye due create karna hai
const USER_EMAIL_TO_ADD_DUE = 'goldi@goldi.com'; 
// ---------------------


// Helper function to get the ISO week identifier for a date
const getWeekIdentifier = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};


const seedDue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected for seeding a due.");

        // 1. Find the user
        const user = await User.findOne({ email: USER_EMAIL_TO_ADD_DUE });
        if (!user) {
            console.log(`❌ User with email ${USER_EMAIL_TO_ADD_DUE} not found.`);
            return;
        }

        // 2. Get admin settings to calculate the correct due amount
        const settings = await AdminSetting.findOne();
        if (!settings) {
            console.log("❌ Admin settings not found. Cannot calculate due amount.");
            return;
        }
        const dueAmount = settings.weeklyContributionAmount + settings.lateFineAmount;

        // 3. Calculate the week identifier for the PREVIOUS week
        const today = new Date();
        const lastWeek = new Date(today.setDate(today.getDate() - 7)); 
        const weekIdentifier = getWeekIdentifier(lastWeek);

        // 4. Check if a due for that week already exists for the user
        const existingDue = await Dues.findOne({ user: user._id, weekIdentifier: weekIdentifier });
        if (existingDue) {
            console.log(`ℹ️ A due for week ${weekIdentifier} already exists for this user. No action taken.`);
            return;
        }

        // 5. Create the new due
        await Dues.create({
            user: user._id,
            amount: dueAmount,
            reason: `[Test Due] Missed contribution for week ${weekIdentifier}`,
            status: 'pending',
            weekIdentifier: weekIdentifier,
        });

        console.log(`🌱 Successfully created a pending due of ₹${dueAmount} for user ${user.name} for week ${weekIdentifier}.`);

    } catch (error) {
        console.error("❌ Error seeding due:", error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
};

seedDue();