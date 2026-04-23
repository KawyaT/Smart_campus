import React, { useEffect, useMemo, useState } from 'react';
import TicketCard from '../../components/TicketCard';
import TicketForm from '../../components/TicketForm';
import TicketAPI from '../../api/ticketAPI';
import { useAuth } from '../../context/AuthContext';
import { notifyUserDashboardMetricsChanged } from '../../utils/dashboardMetricsEvents';
import '../../styles/TicketsPage.css';

const FIRST_RESPONSE_TARGET_HOURS = {
  CRITICAL: 1,
  HIGH: 4,
  MEDIUM: 8,
  LOW: 24,
};

const RESOLUTION_TARGET_HOURS = {
  CRITICAL: 8,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};

const OWNERSHIP_STORE_KEY = 'ticketOwnershipByUser';

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const durationLabel = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return 'Not started';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getSlaData = (ticket) => {
  const createdAt = parseDate(ticket.createdAt);
  const updatedAt = parseDate(ticket.updatedAt);
  const resolvedAt = parseDate(ticket.resolvedAt);
  if (!createdAt) {
    return {
      firstResponseMs: null,
      resolutionMs: null,
      firstResponseBreach: false,
      resolutionBreach: false,
      firstResponseTarget: null,
      resolutionTarget: null,
    };
  }

  const firstResponseAt =
    updatedAt && updatedAt.getTime() > createdAt.getTime() ? updatedAt : null;
  const closed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  const firstResponseMs = firstResponseAt
    ? firstResponseAt.getTime() - createdAt.getTime()
    : null;
  const now = Date.now();
  const resolutionEnd = resolvedAt
    ? resolvedAt.getTime()
    : closed
      ? (parseDate(ticket.updatedAt)?.getTime() || now)
      : (updatedAt?.getTime() || now);
  const resolutionMs = Math.max(0, resolutionEnd - createdAt.getTime());

  const priority = ticket.priority || 'MEDIUM';
  const firstResponseTarget = (FIRST_RESPONSE_TARGET_HOURS[priority] || 8) * 60 * 60 * 1000;
  const resolutionTarget = (RESOLUTION_TARGET_HOURS[priority] || 72) * 60 * 60 * 1000;

  return {
    firstResponseMs,
    resolutionMs,
    firstResponseBreach: typeof firstResponseMs === 'number' && firstResponseMs > firstResponseTarget,
    resolutionBreach: typeof resolutionMs === 'number' && resolutionMs > resolutionTarget,
    firstResponseTarget,
    resolutionTarget,
  };
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const buildUserKey = (user) => user?.id || user?.email || user?.name || null;

const readOwnershipMap = () => {
  try {
    const raw = localStorage.getItem(OWNERSHIP_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveOwnership = (ticketId, userKey) => {
  if (!ticketId || !userKey) return;
  const map = readOwnershipMap();
  map[ticketId] = userKey;
  localStorage.setItem(OWNERSHIP_STORE_KEY, JSON.stringify(map));
};

const isOwnedByCurrentUser = (ticket, user, ownershipMap) => {
  const userKey = buildUserKey(user);
  if (!userKey || !ticket) return false;
  const loweredName = normalizeText(user.name);
  const loweredEmail = normalizeText(user.email);
  const reporterName = normalizeText(ticket.reporterName);
  const matchesReporterId = user.id && ticket.reporterId === user.id;
  const matchesName = loweredName && reporterName && reporterName === loweredName;
  const matchesEmail = loweredEmail && reporterName && reporterName === loweredEmail;
  return matchesReporterId || matchesName || matchesEmail || ownershipMap[ticket.id] === userKey;
};

/** API still stores a generic label for new tickets; show the signed-in user's name in details when it's their report. */
const REPORTER_PLACEHOLDER = /^current\s*user$/i;

const createdByDisplayName = (ticket, user, ownershipMap) => {
  const stored = typeof ticket?.reporterName === 'string' ? ticket.reporterName.trim() : '';
  const mine = user && isOwnedByCurrentUser(ticket, user, ownershipMap);
  const looksPlaceholder = !stored || REPORTER_PLACEHOLDER.test(stored);
  if (looksPlaceholder && user) {
    const label = user.name?.trim() || user.email?.trim();
    if (mine && label) return label;
    const repEmail = typeof ticket?.reporterEmail === 'string' ? ticket.reporterEmail.trim() : '';
    if (repEmail && normalizeText(repEmail) === normalizeText(user.email) && label) {
      return label;
    }
  }
  return stored || 'Unknown';
};

const TicketsPage = ({ scope = 'all', embeddedInAdmin = false }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedComments, setSelectedComments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updateInternal, setUpdateInternal] = useState(false);

  const userRole = String(user?.role || '').toUpperCase();
  const canManage = userRole === 'ADMIN' || userRole === 'TECHNICIAN';
  const canEditOrDelete = userRole !== 'STUDENT';
  const ownershipMap = useMemo(() => readOwnershipMap(), [tickets.length]);

  useEffect(() => {
    fetchTickets();
  }, [scope, user?.id]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      let data = [];
      if (scope === 'mine' && user?.id) {
        // Backend currently uses placeholder reporter identity for ticket creation,
        // so created-by endpoint can be empty for real users. Merge both sources.
        const [createdByResult, allResult] = await Promise.allSettled([
          TicketAPI.getTicketsCreatedBy(user.id),
          TicketAPI.getAllTickets(),
        ]);

        const createdByTickets =
          createdByResult.status === 'fulfilled' && Array.isArray(createdByResult.value?.data)
            ? createdByResult.value.data
            : [];

        const allTickets =
          allResult.status === 'fulfilled' && Array.isArray(allResult.value?.data)
            ? allResult.value.data
            : [];

        const ownedByFallback = allTickets.filter((ticket) =>
          isOwnedByCurrentUser(ticket, user, readOwnershipMap())
        );

        const merged = [...createdByTickets, ...ownedByFallback];
        const uniqueById = [];
        const seen = new Set();
        for (const ticket of merged) {
          if (ticket?.id && !seen.has(ticket.id)) {
            seen.add(ticket.id);
            uniqueById.push(ticket);
          }
        }
        data = uniqueById;
      } else if (scope === 'assigned' && user?.id) {
        const assignedResponse = await TicketAPI.getTicketsByAssignee(user.id);
        data = Array.isArray(assignedResponse.data) ? assignedResponse.data : [];
      } else {
        const response = await TicketAPI.getAllTickets();
        data = Array.isArray(response.data) ? response.data : [];
      }
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketClick = async (ticket) => {
    setShowForm(false);
    try {
      const detailRes = await TicketAPI.getTicketById(ticket.id);
      const detail = detailRes.data;
      setSelectedTicket(detail);
      if (Array.isArray(detail.comments)) {
        setSelectedComments(detail.comments);
      } else {
        const response = await TicketAPI.getTicketComments(ticket.id);
        setSelectedComments(response.data || []);
      }
    } catch (err) {
      console.error('Error loading ticket details:', err);
      setSelectedTicket(ticket);
      try {
        const response = await TicketAPI.getTicketComments(ticket.id);
        setSelectedComments(response.data || []);
      } catch (e2) {
        setSelectedComments([]);
      }
    }
  };

  const handleAddComment = async (commentData, silent = false) => {
    try {
      const response = await TicketAPI.addComment(selectedTicket.id, commentData);
      setSelectedComments((prev) => [...prev, response.data]);
      if (!silent) {
        alert('Update posted successfully.');
      }
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to post update.');
      return false;
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
      if (scope === 'all' || scope === 'mine') {
        setTickets((prev) => [response.data, ...prev]);
      }
      saveOwnership(response.data?.id, buildUserKey(user));
      setShowForm(false);
      setSelectedTicket(response.data);
      notifyUserDashboardMetricsChanged();
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
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? response.data : t)));
      setSelectedTicket(response.data);
      setShowForm(false);
      notifyUserDashboardMetricsChanged();
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const response = await TicketAPI.updateTicket(selectedTicket.id, {
        status: newStatus,
      });
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? response.data : t)));
      setSelectedTicket(response.data);
      notifyUserDashboardMetricsChanged();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  const handleTechnicianUpdate = async () => {
    if (!selectedTicket || !updateNote.trim()) return;
    const success = await handleAddComment(
      {
        content: updateNote.trim(),
        internal: updateInternal,
        authorName: user?.name || 'Technician',
      },
      true
    );
    if (success) {
      setUpdateNote('');
      setUpdateInternal(false);
      await fetchTickets();
      alert('Technician update posted.');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await TicketAPI.deleteTicket(id);
        setTickets((prev) => prev.filter((t) => t.id !== id));
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
        }
        notifyUserDashboardMetricsChanged();
        alert('Ticket deleted successfully!');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Failed to delete ticket');
      }
    }
  };

  const filteredTickets = getFilteredTickets();
  const selectedSla = selectedTicket ? getSlaData(selectedTicket) : null;

  const slaSummary = useMemo(() => {
    const withResponse = tickets
      .map((ticket) => getSlaData(ticket))
      .filter((sla) => typeof sla.firstResponseMs === 'number');
    const withResolution = tickets
      .map((ticket) => getSlaData(ticket))
      .filter((sla) => typeof sla.resolutionMs === 'number');

    const avg = (arr, field) => {
      if (!arr.length) return null;
      const total = arr.reduce((sum, item) => sum + item[field], 0);
      return total / arr.length;
    };

    return {
      avgFirstResponseMs: avg(withResponse, 'firstResponseMs'),
      avgResolutionMs: avg(withResolution, 'resolutionMs'),
      firstResponseBreachCount: withResponse.filter((x) => x.firstResponseBreach).length,
      resolutionBreachCount: withResolution.filter((x) => x.resolutionBreach).length,
    };
  }, [tickets]);

  const pageTitle =
    scope === 'mine'
      ? 'My Maintenance Tickets'
      : scope === 'assigned'
        ? 'My Assigned Tickets'
        : 'Maintenance & Incident Ticketing';

  const canCreate = scope !== 'assigned';

  return (
    <div className={`tickets-page${embeddedInAdmin ? ' tickets-page--admin-shell' : ''}`}>
      {embeddedInAdmin ? (
        <>
          <section className="admin-users-hero" aria-labelledby="tickets-admin-hero-title">
            <div className="admin-users-hero-inner">
              <div className="admin-users-hero-copy">
                <span className="admin-users-hero-kicker">Incidents</span>
                <h1 id="tickets-admin-hero-title" className="admin-users-hero-title">
                  Incident command
                </h1>
                <p className="admin-users-hero-lead">
                  Track maintenance and incidents with service-level timers for first response and resolution.
                </p>
              </div>
              <div className="admin-users-hero-accent" aria-hidden>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="56" height="56">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.25}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3h2a1 1 0 010 2H3v3a2 2 0 002 2h2a1 1 0 012 0h2a1 1 0 012 0h2a1 1 0 012 0h2a2 2 0 002-2v-3h-2a1 1 0 010-2h2V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
            </div>
          </section>
          {canCreate ? (
            <div className="admin-embed-toolbar">
              <button
                type="button"
                className="admin-embed-primary-btn"
                onClick={() => {
                  setSelectedTicket(null);
                  setShowForm(!showForm);
                }}
              >
                {showForm ? 'Cancel' : 'Report incident'}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="page-header">
          <div>
            <h1>{pageTitle}</h1>
            <p className="tickets-subtitle">
              Service-level timers included: time-to-first-response and time-to-resolution.
            </p>
          </div>
          {canCreate ? (
            <button
              className="primary-btn"
              onClick={() => {
                setSelectedTicket(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'Report Incident'}
            </button>
          ) : null}
        </div>
      )}

      <section className="sla-summary-grid" aria-label="SLA summary">
        <article className="sla-summary-card">
          <p>Average first response</p>
          <strong>{durationLabel(slaSummary.avgFirstResponseMs)}</strong>
          <small>Breaches: {slaSummary.firstResponseBreachCount}</small>
        </article>
        <article className="sla-summary-card">
          <p>Average resolution</p>
          <strong>{durationLabel(slaSummary.avgResolutionMs)}</strong>
          <small>Breaches: {slaSummary.resolutionBreachCount}</small>
        </article>
        <article className="sla-summary-card">
          <p>Total in this view</p>
          <strong>{tickets.length}</strong>
          <small>Filtered by your access scope</small>
        </article>
      </section>

      {showForm && (
        <div className="form-container">
          <h2>{selectedTicket ? 'Edit Ticket' : 'Report Incident'}</h2>
          <TicketForm
            initialData={selectedTicket}
            onSubmit={selectedTicket ? handleUpdateTicket : handleCreateTicket}
            isLoading={isLoading}
            canManage={canManage}
          />
        </div>
      )}

      {selectedTicket && !showForm && (
        <div className="detail-container">
          <div className="detail-header">
            <h2>{selectedTicket.title}</h2>
            <button
              className="close-modal"
              onClick={() => setSelectedTicket(null)}
            >
              x
            </button>
          </div>

          <div className="detail-content">
            <div className="status-update-section">
              <label>Quick status update:</label>
              <select 
                value={selectedTicket.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
                disabled={!canManage}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              {!canManage ? <small>Only admin or technician can change status.</small> : null}
            </div>

            {selectedSla ? (
              <section className="sla-metrics-panel" aria-label="Service-level timers">
                <div className="sla-metric-item">
                  <p>Time to first response</p>
                  <strong>{durationLabel(selectedSla.firstResponseMs)}</strong>
                  <span className={`sla-badge ${selectedSla.firstResponseBreach ? 'breach' : 'on-track'}`}>
                    {selectedSla.firstResponseBreach ? 'Breach' : 'On track'}
                  </span>
                  <small>Target: {durationLabel(selectedSla.firstResponseTarget)}</small>
                </div>
                <div className="sla-metric-item">
                  <p>Time to resolution</p>
                  <strong>{durationLabel(selectedSla.resolutionMs)}</strong>
                  <span className={`sla-badge ${selectedSla.resolutionBreach ? 'breach' : 'on-track'}`}>
                    {selectedSla.resolutionBreach ? 'Breach' : 'On track'}
                  </span>
                  <small>Target: {durationLabel(selectedSla.resolutionTarget)}</small>
                </div>
              </section>
            ) : null}

            <div className="detail-grid">
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
                  <span>{selectedTicket.assignedToName || 'Unassigned'}</span>
                </div>
                <div className="info-group">
                  <label>Created By:</label>
                  <span>{createdByDisplayName(selectedTicket, user, ownershipMap)}</span>
                </div>
                <div className="info-group">
                  <label>Created At:</label>
                  <span>{formatDateTime(selectedTicket.createdAt)}</span>
                </div>
                <div className="info-group">
                  <label>Resolved At:</label>
                  <span>{formatDateTime(selectedTicket.resolvedAt)}</span>
                </div>
              </div>

              <div className="detail-description">
                <h3>Description</h3>
                <p>{selectedTicket.description}</p>

                {selectedTicket.imageBase64 && (
                  <div className="attachment-block">
                    <h3>Report Image</h3>
                    <img src={selectedTicket.imageBase64} alt="Incident" className="detail-image" />
                  </div>
                )}
                
                {selectedTicket.resolutionNotes && (
                  <div className="attachment-block">
                    <h3>Resolution Notes</h3>
                    <p>{selectedTicket.resolutionNotes}</p>
                  </div>
                )}

                {Array.isArray(selectedTicket.imageGalleryBase64) && selectedTicket.imageGalleryBase64.length > 0 ? (
                  <div className="attachment-block">
                    <h3>Attachments</h3>
                    <div className="attachment-grid">
                      {selectedTicket.imageGalleryBase64.map((image, idx) => (
                        <img key={`${selectedTicket.id}-gallery-${idx}`} src={image} alt={`Attachment ${idx + 1}`} className="detail-image" />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <section className="comment-section">
              <h3>Technician updates</h3>
              {canManage ? (
                <div className="comment-editor">
                  <textarea
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="Write progress update, investigation findings, or handover note"
                    rows={3}
                  />
                  <label className="internal-toggle">
                    <input
                      type="checkbox"
                      checked={updateInternal}
                      onChange={(e) => setUpdateInternal(e.target.checked)}
                    />
                    Internal note
                  </label>
                  <button type="button" className="primary-btn" onClick={handleTechnicianUpdate}>
                    Post update
                  </button>
                </div>
              ) : null}
              <div className="comment-list">
                {selectedComments.length > 0 ? (
                  selectedComments
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((comment) => (
                      <article key={comment.id} className="comment-item">
                        <header>
                          <strong>{comment.authorName || 'Team member'}</strong>
                          <small>{formatDateTime(comment.createdAt)}</small>
                        </header>
                        <p>{comment.content}</p>
                      </article>
                    ))
                ) : (
                  <p className="no-updates">No updates yet.</p>
                )}
              </div>
            </section>

            <div className="detail-actions">
              <button
                className="ticket-back-btn"
                type="button"
                onClick={() => {
                  setSelectedTicket(null);
                  setShowForm(false);
                }}
              >
                Back to all tickets
              </button>
              <button
                className="ticket-edit-btn"
                disabled={!canEditOrDelete}
                onClick={() => setShowForm(true)}
              >
                Edit details
              </button>
              <button
                className="ticket-delete-btn"
                disabled={!canEditOrDelete}
                onClick={() => handleDeleteTicket(selectedTicket.id)}
              >
                Delete ticket
              </button>
            </div>

            {!canEditOrDelete ? (
              <small className="ticket-action-note">Edit and delete are disabled for student view.</small>
            ) : null}

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
                  canDelete={canEditOrDelete}
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
