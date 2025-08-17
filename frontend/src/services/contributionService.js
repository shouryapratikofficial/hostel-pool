import api from './api';

export const getContributionStatus = () => api.get('/contributions/status');
export const getContributionHistory = () => api.get('/contributions/history');
export const addContribution = (amount) => api.post('/contributions/add', { amount });