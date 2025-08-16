const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected for admin seeding.");

        const adminEmail = 'admin2@example.com';

        // Check if an admin user already exists
        const adminExists = await User.findOne({ email: adminEmail });
        if (adminExists) {
            console.log("ℹ️ Admin user already exists. No action taken.");
            return;
        }

        // Create the new admin user
        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: 'adminpassword', // Use a strong password in a real project!
            role: 'admin'
        });

        console.log("🌱 Admin user created successfully!");

    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
};

seedAdmin();