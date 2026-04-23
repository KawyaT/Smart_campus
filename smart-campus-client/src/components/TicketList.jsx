import React from 'react';
import '../styles/TicketList.css';

const TicketList = ({ tickets, onSelectTicket, filters }) => {
  const getStatusColor = (status) => {
    const colors = {
      OPEN: '#2196F3',
      IN_PROGRESS: '#FF9800',
      RESOLVED: '#4CAF50',
      CLOSED: '#9C27B0',
      ON_HOLD: '#E91E63',
    };
    return colors[status] || '#757575';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    return icons[priority] || '⚪';
  };

  return (
    <div className="ticket-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Location</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <strong>#{ticket.id.substring(0, 8)}</strong>
                </td>
                <td className="title-cell">
                  <strong>{ticket.title}</strong>
                  <p>{ticket.description.substring(0, 50)}...</p>
                </td>
                <td>{ticket.category}</td>
                <td>
                  <span className="priority-badge">
                    {getPriorityIcon(ticket.priority)} {ticket.priority}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.location || 'N/A'}</td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => onSelectTicket(ticket)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;
