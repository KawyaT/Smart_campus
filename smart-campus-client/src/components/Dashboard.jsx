import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Routes to role-specific dashboard UI. ADMIN sees the administration console;
 * USER and TECHNICIAN see the standard campus dashboard.
 */
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;
