// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep axios default header in sync with user token
    if (user?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [user]);

const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return { ok: true, data };
    } catch (err) {
      setLoading(false);
      // --- YEH HISSA SABSE ZAROORI HAI ---
      // Error ke saath 'inactive' signal ko bhi pakdein
      const message = err.response?.data?.message || err.message;
      const inactive = err.response?.data?.inactive || false; 
      
      // Dono cheezon ko Login page par wapas bhejein
      return { ok: false, message, inactive };
    }
  };

  const register = async (name, email, password, role = 'member') => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return { ok: true, data };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || err.message;
      return { ok: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
