const cron = require('node-cron');
const { distributeProfitForMonth } = require('../utils/profitHelper');

const runMonthlyDistribution = async () => {
    console.log('Running monthly profit distribution cron job...');
    const today = new Date();
    const result = await distributeProfitForMonth(today);
    console.log(result.message);
};

cron.schedule('0 2 1 * *', runMonthlyDistribution);
console.log('✅ Monthly profit distribution cron job scheduled.');