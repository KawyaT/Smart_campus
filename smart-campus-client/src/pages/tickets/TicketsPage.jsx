import React, { useState, useEffect } from 'react';
import TicketCard from '../../components/TicketCard';
import TicketForm from '../../components/TicketForm';
import TicketComments from '../../components/TicketComments';
import TicketAPI from '../../api/ticketAPI';
import '../../styles/TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedComments, setSelectedComments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
    setShowForm(false);
    try {
      const response = await TicketAPI.getTicketComments(ticket.id);
      setSelectedComments(response.data || []);
    } catch(err) {
      console.error('Error fetching comments:', err);
      setSelectedComments([]);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      const response = await TicketAPI.addComment(selectedTicket.id, commentData);
      setSelectedComments([...selectedComments, response.data]);
      alert("Comment added successfully!");
    } catch (err) {
      console.error('Error adding comment:', err);
      alert("Failed to add comment.");
    }
  };

  const getFilteredTickets = () => {
    let filtered = tickets;
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }
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
      setSelectedTicket(response.data);
      setShowForm(false);
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if(!selectedTicket) return;
    try {
      const response = await TicketAPI.updateTicket(selectedTicket.id, { ...selectedTicket, status: newStatus });
      setTickets(tickets.map((t) => (t.id === selectedTicket.id ? response.data : t)));
      setSelectedTicket(response.data);
    } catch(err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
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
        <h1>??? Maintenance & Incident Ticketing</h1>
        <button
          className="create-btn"
          onClick={() => {
            setSelectedTicket(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '? Cancel' : '+ Report Incident'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{selectedTicket ? 'Edit Ticket' : 'Report Incident'}</h2>
          <TicketForm
            initialData={selectedTicket}
            onSubmit={selectedTicket ? handleUpdateTicket : handleCreateTicket}
            isLoading={isLoading}
          />
        </div>
      )}

      {selectedTicket && !showForm && (
        <div className="detail-container">
          <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h2>{selectedTicket.title}</h2>
            <button
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
              onClick={() => setSelectedTicket(null)}
            >
              ?
            </button>
          </div>
          
          <div className="detail-content" style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexDirection: 'column' }}>
            
            <div className="status-update-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Quick Status Update (Admin/Tech):</label>
              <select 
                value={selectedTicket.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div className="detail-info" style={{ flex: '1' }}>
                <div className="info-group">
                  <label>Status:</label>
                  <span className="badge" style={{ padding: '4px 8px', borderRadius: '4px', background: '#e3f2fd', fontWeight: 'bold' }}>{selectedTicket.status}</span>
                </div>
                <div className="info-group">
                  <label>Priority:</label>
                  <span className="badge" style={{ padding: '4px 8px', borderRadius: '4px', background: '#fff3e0', fontWeight: 'bold' }}>{selectedTicket.priority}</span>
                </div>
                <div className="info-group" style={{ marginTop: '10px' }}>
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
                  <span>{selectedTicket.reporterName || selectedTicket.createdBy || 'Unknown'}</span>
                </div>
                <div className="info-group">
                  <label>Created At:</label>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-description" style={{ flex: '2', background: '#fcfcfc', padding: '1.5rem', borderRadius: '8px' }}>
                <h3>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedTicket.description}</p>

                {selectedTicket.imageBase64 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h3>Report Image</h3>
                    <img src={selectedTicket.imageBase64} alt="Incident" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </div>
                )}
                
                {selectedTicket.resolution && (
                  <div style={{ marginTop: '1rem' }}>
                    <h3>Resolution</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedTicket.resolution}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="comments-section" style={{ marginTop: '2rem' }}>
               <TicketComments ticketId={selectedTicket.id} comments={selectedComments} onAddComment={handleAddComment} />
            </div>

            <div className="detail-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="edit-btn"
                style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => setShowForm(true)}
              >
                Edit Details
              </button>
              <button
                className="delete-btn"
                style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => handleDeleteTicket(selectedTicket.id)}
              >
                Delete Ticket
              </button>
            </div>

          </div>
        </div>
      )}

      {!showForm && !selectedTicket && (
        <>
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

          <div className="tickets-grid">
            {isLoading ? (
              <div className="loading">Loading tickets...</div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                  onDelete={handleDeleteTicket}
                />
              ))
            ) : (
              <div className="no-tickets" style={{ textAlign: 'center', width: '100%', padding: '2rem', color: 'gray' }}>
                 No tickets found matching your criteria.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TicketsPage;
