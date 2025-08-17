import api from './api';
//user
export const getDashboardData = () => api.get('/users/dashboard');
export const withdrawBalance = (amount) => api.post('/users/account/withdraw', { amount });
export const deactivateAccount = () => api.patch('/users/account/deactivate');

// Admin
export const getAllUsers = () => api.get('/users/all-users');
export const getAdminDashboardStats = () => api.get('/users/admin/dashboard');
export const getAdminSettings = () => api.get('/users/admin/settings');
export const updateAdminSettings = (settings) => api.patch('/users/admin/settings', settings);

