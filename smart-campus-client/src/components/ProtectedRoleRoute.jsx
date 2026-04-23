import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** ADMIN only — others sent to /user-dashboard. */
export function AdminDashboardRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/user-dashboard" replace />;
  }
  return children;
}

/** USER / TECHNICIAN — ADMIN sent to /admin-dashboard. */
export function UserDashboardRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  return children;
}
