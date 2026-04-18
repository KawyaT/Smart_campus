import React, { useState, useEffect } from 'react';
import TicketCard from '../../components/TicketCard';
import TicketForm from '../../components/TicketForm';
import TicketAPI from '../../api/ticketAPI';
import '../../styles/TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Load all tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await TicketAPI.getAllTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tickets based on selected filters and search query
  const getFilteredTickets = () => {
    let filtered = tickets;

    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.includes(query)
      );
    }

    return filtered;
  };

  const handleCreateTicket = async (formData) => {
    try {
      setIsLoading(true);
      const response = await TicketAPI.createTicket(formData);
      setTickets([...tickets, response.data]);
      setShowForm(false);
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTicket = async (formData) => {
    try {
      setIsLoading(true);
      const response = await TicketAPI.updateTicket(selectedTicket.id, formData);
      setTickets(tickets.map((t) => (t.id === selectedTicket.id ? response.data : t)));
      setSelectedTicket(null);
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await TicketAPI.deleteTicket(id);
        setTickets(tickets.filter((t) => t.id !== id));
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
        }
        alert('Ticket deleted successfully!');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Failed to delete ticket');
      }
    }
  };

  const filteredTickets = getFilteredTickets();

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>🔧 Maintenance & Incident Ticketing</h1>
        <button
          className="create-btn"
          onClick={() => {
            setSelectedTicket(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}</h2>
          <TicketForm
            initialData={selectedTicket}
            onSubmit={selectedTicket ? handleUpdateTicket : handleCreateTicket}
            isLoading={isLoading}
          />
        </div>
      )}

      {selectedTicket && !showForm && (
        <div className="detail-container">
          <div className="detail-header">
            <h2>{selectedTicket.title}</h2>
            <button
              className="close-btn"
              onClick={() => setSelectedTicket(null)}
            >
              ✕
            </button>
          </div>
          <div className="detail-content">
            <div className="detail-info">
              <div className="info-group">
                <label>Status:</label>
                <span className="badge">{selectedTicket.status}</span>
              </div>
              <div className="info-group">
                <label>Priority:</label>
                <span className="badge">{selectedTicket.priority}</span>
              </div>
              <div className="info-group">
                <label>Category:</label>
                <span>{selectedTicket.category}</span>
              </div>
              <div className="info-group">
                <label>Location:</label>
                <span>{selectedTicket.location || 'N/A'}</span>
              </div>
              <div className="info-group">
                <label>Assigned To:</label>
                <span>{selectedTicket.assignedTo || 'Unassigned'}</span>
              </div>
              <div className="info-group">
                <label>Created By:</label>
                <span>{selectedTicket.createdBy}</span>
              </div>
              <div className="info-group">
                <label>Created At:</label>
                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="detail-description">
              <h3>Description</h3>
              <p>{selectedTicket.description}</p>
              {selectedTicket.resolution && (
                <>
                  <h3>Resolution</h3>
                  <p>{selectedTicket.resolution}</p>
                </>
              )}
              {selectedTicket.notes && (
                <>
                  <h3>Notes</h3>
                  <p>{selectedTicket.notes}</p>
                </>
              )}
            </div>
          </div>
          <div className="detail-actions">
            <button
              className="edit-btn"
              onClick={() => setShowForm(true)}
            >
              Edit Ticket
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDeleteTicket(selectedTicket.id)}
            >
              Delete Ticket
            </button>
          </div>
        </div>
      )}

      {!showForm && !selectedTicket && (
        <div className="filters-container">
          <input
            type="text"
            placeholder="Search tickets by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      )}

      {!showForm && !selectedTicket && (
        <div className="tickets-grid">
          {isLoading ? (
            <div className="loading">Loading tickets...</div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => setSelectedTicket(ticket)}
                onDelete={handleDeleteTicket}
              />
            ))
          ) : (
            <div className="no-tickets">No tickets found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
