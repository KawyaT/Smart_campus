import React, { useState, useEffect } from 'react';
import TicketAPI from '../../api/ticketAPI';
import '../../styles/TicketDashboard.css';

const toDuration = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return 'Not started';
  const minutes = Math.floor(ms / (1000 * 60));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

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

  const avgSla = tickets.reduce(
    (acc, ticket) => {
      const createdAt = ticket.createdAt ? new Date(ticket.createdAt).getTime() : null;
      const updatedAt = ticket.updatedAt ? new Date(ticket.updatedAt).getTime() : null;
      const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : null;

      if (createdAt && updatedAt && updatedAt > createdAt) {
        acc.firstResponseTotal += updatedAt - createdAt;
        acc.firstResponseCount += 1;
      }
      if (createdAt && resolvedAt && resolvedAt > createdAt) {
        acc.resolutionTotal += resolvedAt - createdAt;
        acc.resolutionCount += 1;
      }
      return acc;
    },
    { firstResponseTotal: 0, firstResponseCount: 0, resolutionTotal: 0, resolutionCount: 0 }
  );

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

            <div className="stat-card total">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <p className="stat-label">Avg First Response</p>
                <p className="stat-value">
                  {toDuration(
                    avgSla.firstResponseCount > 0
                      ? avgSla.firstResponseTotal / avgSla.firstResponseCount
                      : null
                  )}
                </p>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">🛠️</div>
              <div className="stat-content">
                <p className="stat-label">Avg Resolution</p>
                <p className="stat-value">
                  {toDuration(
                    avgSla.resolutionCount > 0
                      ? avgSla.resolutionTotal / avgSla.resolutionCount
                      : null
                  )}
                </p>
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
