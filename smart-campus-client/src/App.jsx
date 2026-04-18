import { useState } from "react";
import TicketDashboard from "./pages/tickets/TicketDashboard";
import TicketsPage from "./pages/tickets/TicketsPage";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-effect">
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
            <span className="icon">??</span>
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === "tickets" ? "active" : ""}`}
            onClick={() => setActiveTab("tickets")}
          >
            <span className="icon">???</span>
            All Tickets
          </button>

          <button className="nav-item">
            <span className="icon">??</span>
            Facilities
          </button>

          <button className="nav-item">
            <span className="icon">??</span>
            Bookings
          </button>
          
          <button className="nav-item">
            <span className="icon">??</span>
            Settings
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

      {/* Main Content */}
      <main className="main-content">
        <div className="top-nav glass-effect">
          <div className="search-bar">
            <span className="search-icon">??</span>
            <input type="text" placeholder="Search campus operations..." />
          </div>
          <div className="top-actions">
            <button className="notification-btn">??</button>
          </div>
        </div>

        <div className="content-wrapper scrollable">
          {activeTab === "dashboard" && <TicketDashboard />}
          {activeTab === "tickets" && <TicketsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
