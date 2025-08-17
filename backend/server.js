const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const helmet = require('helmet'); // 1. Import helmet
const { errorHandler } = require('./middleware/errorMiddleware'); // 1. Import the new middleware

require('./cron/profitDistribution');
require('./cron/weeklyDues');

dotenv.config();
connectDB();

const app = express();

app.use(helmet()); // 2. Use helmet middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/profit', require('./routes/profitRoutes'));
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.use(errorHandler); // 2. Use the error handler AFTER all your routes


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));