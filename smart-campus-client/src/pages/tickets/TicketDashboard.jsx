import React, { useState, useEffect } from 'react';
import TicketAPI from '../api/ticketAPI';
import '../styles/TicketDashboard.css';

const TicketDashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    criticalTickets: 0,
    highTickets: 0,
    resolvedTickets: 0,
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        TicketAPI.getDashboardStats(),
        TicketAPI.getAllTickets(),
      ]);
      setStats(statsRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentTickets = () => {
    return tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getPendingTickets = () => {
    return tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Ticketing Dashboard</h1>
        <button onClick={fetchDashboardData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <p className="stat-label">Total Tickets</p>
                <p className="stat-value">{stats.totalTickets}</p>
              </div>
            </div>

            <div className="stat-card open">
              <div className="stat-icon">🔓</div>
              <div className="stat-content">
                <p className="stat-label">Open Tickets</p>
                <p className="stat-value">{stats.openTickets}</p>
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <p className="stat-label">Critical</p>
                <p className="stat-value">{stats.criticalTickets}</p>
              </div>
            </div>

            <div className="stat-card high">
              <div className="stat-icon">🟠</div>
              <div className="stat-content">
                <p className="stat-label">High Priority</p>
                <p className="stat-value">{stats.highTickets}</p>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <p className="stat-label">Resolved</p>
                <p className="stat-value">{stats.resolvedTickets}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h2>Recent Tickets</h2>
              <div className="recent-tickets">
                {getRecentTickets().length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecentTickets().map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{ticket.title.substring(0, 40)}</td>
                          <td>
                            <span className={`priority ${ticket.priority.toLowerCase()}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`status ${ticket.status.toLowerCase()}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No tickets yet</p>
                )}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Pending Tickets</h2>
              <div className="pending-count">
                <p className="count-number">{getPendingTickets().length}</p>
                <p className="count-label">Awaiting Action</p>
              </div>
              {getPendingTickets().length > 0 && (
                <ul className="pending-list">
                  {getPendingTickets().slice(0, 3).map((ticket) => (
                    <li key={ticket.id}>
                      <span className="bullet">•</span>
                      <span className="title">{ticket.title.substring(0, 50)}</span>
                      <span className="priority">{ticket.priority}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketDashboard;
