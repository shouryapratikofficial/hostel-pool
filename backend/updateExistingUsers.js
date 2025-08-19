const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const updateUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected for updating users.");

        // Find all users who are not yet verified and update them
        const result = await User.updateMany(
            { isVerified: { $ne: true } }, // Find users where isVerified is not true
            { $set: { isVerified: true } }    // Set isVerified to true
        );

        console.log(`- Found ${result.matchedCount} users to update.`);
        console.log(`✅ Successfully updated ${result.modifiedCount} users.`);

    } catch (error) {
        console.error("❌ Error updating users:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
};

updateUsers();