import api from './api';

export const getTransactionHistory = () => api.get('/profit/history');

// Admin
export const getProfitStatus = () => api.get('/profit/status');
export const distributeProfit = () => api.post('/profit/distribute');