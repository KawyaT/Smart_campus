import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

/**
 * Routes to role-specific dashboard UI. ADMIN sees the administration console;
 * USER and TECHNICIAN use `/user-dashboard` (layout + nested routes).
 */
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <Navigate to="/user-dashboard" replace />;
};

export default Dashboard;
