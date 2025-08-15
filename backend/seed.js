const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contribution = require('./models/Contribution'); // Import your model
const User = require('./models/User'); // Import User model to get a real user ID

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const seedContributions = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected for seeding.");

        // Find a real user to associate the contribution with
        const user = await User.findOne({ email: 'admin@example.com' }); // Change to a real test user's email
        if (!user) {
            console.log("❌ Test user not found. Please create one first.");
            return;
        }

        // Clean existing contributions if you want
        // await Contribution.deleteMany({});
        
        const dummyContributions = [
            {
                user: user._id, // Use the real user's ID
                amount: 100,
                // Make sure the date is in the previous month (July)
                createdAt: new Date('2025-07-05T10:00:00.000Z'),
                date: new Date('2025-07-05T10:00:00.000Z')
            },
            {
                user: user._id,
                amount: 100,
                createdAt: new Date('2025-07-12T10:00:00.000Z'),
                date: new Date('2025-07-12T10:00:00.000Z')
            },
            {
                user: user._id,
                amount: 100,
                createdAt: new Date('2025-07-19T10:00:00.000Z'),
                date: new Date('2025-07-19T10:00:00.000Z')
            },
            {
                user: user._id,
                amount: 100,
                createdAt: new Date('2025-07-26T10:00:00.000Z'),
                date: new Date('2025-07-26T10:00:00.000Z')
            }
        ];

        await Contribution.insertMany(dummyContributions);

        console.log("🌱 Dummy contributions created successfully!");

    } catch (error) {
        console.error("❌ Error seeding data:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

seedContributions();