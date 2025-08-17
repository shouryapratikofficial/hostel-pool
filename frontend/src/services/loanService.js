import api from './api';

// User
export const getMyLoans = () => api.get('/loans/myloans');
export const requestLoan = (amount, purpose) => api.post('/loans/request', { amount, purpose });
export const getRepaymentDetails = (id) => api.get(`/loans/${id}/repayment-details`);
export const repayLoan = (id) => api.patch(`/loans/${id}/repay`);

// Admin
export const getAllLoans = () => api.get('/loans/all');
export const approveLoan = (id) => api.patch(`/loans/${id}/approve`);
export const rejectLoan = (id) => api.patch(`/loans/${id}/reject`);