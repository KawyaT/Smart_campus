import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import OAuthSuccess from './components/OAuthSuccess';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { AdminDashboardRoute, UserDashboardRoute } from './components/ProtectedRoleRoute';

const homePathForUser = (user) =>
  user?.role === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app" data-theme="smartuni">
          <ToastContainer position="top-right" autoClose={2500} pauseOnHover theme="light" />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            <Route
              path="/admin-dashboard"
              element={
                <AdminDashboardRoute>
                  <AdminDashboard />
                </AdminDashboardRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <UserDashboardRoute>
                  <UserDashboard />
                </UserDashboardRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
