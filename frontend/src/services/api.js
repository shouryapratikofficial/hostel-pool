// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // set VITE_API_URL in .env if backend not on same host/port
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from localStorage on every request (safe fallback)
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch (e) {
    // ignore parse errors
  }
  return config;
}, (err) => Promise.reject(err));

export default api;
