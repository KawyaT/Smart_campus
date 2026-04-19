import React from 'react';
import '../styles/TicketCard.css';

const TicketCard = ({ ticket, onClick, onDelete }) => {
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

  return (
    <div 
      className="ticket-card" 
      style={{ borderLeftColor: getPriorityColor(ticket.priority) }}
      onClick={onClick}
    >
      <div className="ticket-header">
        <h3>{ticket.title}</h3>
        <button 
          className="delete-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ticket.id);
          }}
        >
          ×
        </button>
      </div>      {ticket.imageBase64 && (
        <div className="ticket-card-image" style={{ marginBottom: "10px" }}>
           <img src={ticket.imageBase64} alt="Thumbnail" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px" }} />
        </div>
      )}      <p className="ticket-description">{ticket.description.substring(0, 100)}...</p>
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
      <div className="ticket-footer">
        <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
        {ticket.location && <small>� {ticket.location}</small>}
      </div>
    </div>
  );
};

export default TicketCard;
