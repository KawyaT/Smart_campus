import React from 'react';
import '../styles/TicketCard.css';

const TicketCard = ({ ticket, onClick, onDelete, canDelete = true }) => {
  const getDuration = (start, end) => {
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
      return 'Not started';
    }
    const minutes = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'HIGH':
        return '#f57c00';
      case 'MEDIUM':
        return '#fbc02d';
      case 'LOW':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'OPEN':
        return '#e3f2fd';
      case 'IN_PROGRESS':
        return '#fff3e0';
      case 'RESOLVED':
        return '#e8f5e9';
      case 'CLOSED':
        return '#f3e5f5';
      case 'ON_HOLD':
        return '#fce4ec';
      default:
        return '#f5f5f5';
    }
  };

  const description = ticket.description || '';
  const trimmedDescription =
    description.length > 120 ? `${description.substring(0, 117)}...` : description;

  const firstResponse = getDuration(ticket.createdAt, ticket.updatedAt);
  const resolution = getDuration(ticket.createdAt, ticket.resolvedAt);

  return (
    <div 
      className="ticket-card" 
      style={{ borderLeftColor: getPriorityColor(ticket.priority) }}
      onClick={onClick}
    >
      <div className="ticket-header">
        <h3>{ticket.title}</h3>
        {canDelete ? (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ticket.id);
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {ticket.imageBase64 && (
        <div className="ticket-card-image" style={{ marginBottom: "10px" }}>
           <img src={ticket.imageBase64} alt="Thumbnail" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px" }} />
        </div>
      )}

      <p className="ticket-description">{trimmedDescription}</p>

      <div className="ticket-meta">
        <span 
          className="badge priority" 
          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
        >
          {ticket.priority}
        </span>
        <span 
          className="badge status"
          style={{ backgroundColor: getStatusBg(ticket.status), color: '#333' }}
        >
          {ticket.status}
        </span>
        <span className="badge category">{ticket.category}</span>
      </div>

      <div className="ticket-sla-row">
        <span className="sla-chip">First response: {firstResponse}</span>
        <span className="sla-chip">Resolution: {resolution}</span>
      </div>

      <div className="ticket-footer">
        <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
        {ticket.location && <small>{ticket.location}</small>}
      </div>
    </div>
  );
};

export default TicketCard;
