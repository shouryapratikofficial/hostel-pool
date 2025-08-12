// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  // support both role string or legacy isAdmin boolean
  const isAdmin = user.role === 'admin' || user.isAdmin === true;
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
