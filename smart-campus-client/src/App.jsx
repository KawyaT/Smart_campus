import { useState, useEffect } from "react";
import TicketDashboard from "./pages/tickets/TicketDashboard";
import TicketsPage from "./pages/tickets/TicketsPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import SettingsPage from "./pages/notifications/SettingsPage";
import "./App.css";

function App() {
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
          {activeTab === "tickets" && <TicketsPage />}
          {activeTab === "bookings" && <BookingsPage />}
          {activeTab === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
