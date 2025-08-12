const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
require('./cron/profitDistribution');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
// after app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/profit', require('./routes/profitRoutes'));




app.get('/', (req, res) => {
  res.send('Server is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
