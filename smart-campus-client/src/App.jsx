<<<<<<< feature/bookings
import BookingManagementPage from './pages/bookings/BookingManagementPage'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <BookingManagementPage />
    </main>
  )
=======
import React, { useState, useEffect } from 'react';
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
import TicketDashboard from "./pages/tickets/TicketDashboard";
//import TicketsPage from "./pages/tickets/TicketsPage";
//import BookingsPage from "./pages/bookings/BookingsPage";
//import SettingsPage from "./pages/notifications/SettingsPage";
import "./App.css";

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

// Campus Operations Dashboard Component
const CampusOperationsDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    if (newDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar glass-effect ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo-container">
          <div className="logo-icon">SC</div>
          <h2>Smart Campus</h2>
        </div>
        
        <nav className="nav-menu">
          <div className="nav-section">OPERATIONS</div>
          
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="icon">📊</span>
            <span className="label">Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === "tickets" ? "active" : ""}`}
            onClick={() => setActiveTab("tickets")}
          >
            <span className="icon">🎟️</span>
            <span className="label">All Tickets</span>
          </button>

          <button
            className={`nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="icon">📅</span>
            <span className="label">Bookings</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="icon">⚙️</span>
            <span className="label">Settings</span>
          </button>
        </nav>
        
        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <p className="name">John Doe</p>
            <p className="role">Operations Admin</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-nav glass-effect">
          <div className="nav-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search campus operations..." />
            </div>
          </div>
          <div className="top-actions">
            <button 
              className="theme-toggle"
              onClick={toggleDarkMode}
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button className="notification-btn">🔔</button>
          </div>
        </div>

        <div className="content-wrapper scrollable">
          {activeTab === "dashboard" && <TicketDashboard />}
          {/*{activeTab === "tickets" && <TicketsPage />}*/}
          {/*{activeTab === "bookings" && <BookingsPage />}*/}
          {/*{activeTab === "settings" && <SettingsPage />}*/}
        </div>
      </main>
    </div>
  );
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

            {/* Campus Operations Routes */}
            <Route
              path="/campus-operations"
              element={
                <ProtectedRoute>
                  <CampusOperationsDashboard />
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
>>>>>>> dev
}

export default App;
