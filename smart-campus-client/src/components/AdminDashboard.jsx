import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import { getAllBookingsForAdmin } from '../api/bookingApi';
import { getAllResources } from '../api/resourceApi';
import TicketAPI from '../api/ticketAPI';
import { buildPriorityQueue } from '../utils/adminOverviewUtils';
import logo from '../assets/logo.png';
import AdminUserManagementPanel from './AdminUserManagementPanel';
import AdminFacilitiesPanel from './AdminFacilitiesPanel';
import AdminSecurityAlertPanel from './AdminSecurityAlertPanel';
import BookingManagementPage from '../pages/bookings/BookingManagementPage';
import TicketsPage from '../pages/tickets/TicketsPage';
import './DashboardShell.css';
import './AdminUserManagementPanel.css';
import './AdminDashboard.css';

const IconOverview = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconUsers = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconCalendar = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconTicket = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3h2a1 1 0 010 2H3v3a2 2 0 002 2h2a1 1 0 012 0h2a1 1 0 012 0h2a1 1 0 012 0h2a2 2 0 002-2v-3h-2a1 1 0 010-2h2V7a2 2 0 00-2-2H5z" />
  </svg>
);

const IconBuilding = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconShield = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatToday() {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

const SIDEBAR_NAV = [
  { id: 'overview', label: 'Overview', sub: 'Summary & queue', Icon: IconOverview },
  { id: 'users', label: 'User management', sub: 'Accounts & roles', Icon: IconUsers },
  { id: 'bookings', label: 'Booking approvals', sub: 'Requests', Icon: IconCalendar },
  { id: 'incidents', label: 'Incident command', sub: 'Tickets', Icon: IconTicket },
  { id: 'facilities', label: 'Facilities', sub: 'Resources', Icon: IconBuilding },
  { id: 'security', label: 'Notices', sub: 'Campus notices', Icon: IconShield },
];

const AdminPlaceholder = ({ title, body }) => (
  <div className="admin-page">
    <header className="admin-page-head">
      <h1 className="admin-page-title">{title}</h1>
      <p className="admin-page-lead">{body}</p>
    </header>
    <div className="admin-placeholder-card">
      <p>This area will connect to backend features as they are added.</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [overviewLoad, setOverviewLoad] = useState({
    loading: false,
    pendingBookings: null,
    openIncidents: null,
    catalogueCount: null,
    queue: [],
    errorBookings: false,
    errorTickets: false,
    errorResources: false,
  });

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await usersAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e.response?.status === 403
          ? 'You do not have permission to load users.'
          : e.response?.data?.message || e.message || 'Could not load users.';
      setUsersError(msg);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onDocMouseDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [userMenuOpen]);

  const registeredCount = users.length;

  useEffect(() => {
    if (activeNav !== 'overview') return undefined;
    let cancelled = false;

    const loadOverview = async () => {
      setOverviewLoad((prev) => ({ ...prev, loading: true }));
      try {
        const settled = await Promise.allSettled([
          getAllBookingsForAdmin('PENDING', ''),
          TicketAPI.getAllTickets(),
          getAllResources(),
        ]);
        if (cancelled) return;

        const pendingRaw = settled[0].status === 'fulfilled' ? settled[0].value : null;
        const pendingBookings = Array.isArray(pendingRaw) ? pendingRaw : [];

        let tickets = [];
        if (settled[1].status === 'fulfilled') {
          const payload = settled[1].value?.data;
          tickets = Array.isArray(payload) ? payload : [];
        }

        let resources = [];
        if (settled[2].status === 'fulfilled') {
          const payload = settled[2].value?.data;
          resources = Array.isArray(payload) ? payload : [];
        }

        const openIncidents = tickets.filter(
          (t) => t && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
        ).length;

        setOverviewLoad({
          loading: false,
          pendingBookings: pendingBookings.length,
          openIncidents,
          catalogueCount: resources.length,
          queue: buildPriorityQueue(pendingBookings, tickets),
          errorBookings: settled[0].status !== 'fulfilled',
          errorTickets: settled[1].status !== 'fulfilled',
          errorResources: settled[2].status !== 'fulfilled',
        });
      } catch {
        if (!cancelled) {
          setOverviewLoad((prev) => ({
            ...prev,
            loading: false,
            errorBookings: true,
            errorTickets: true,
            errorResources: true,
          }));
        }
      }
    };

    loadOverview();
    return () => {
      cancelled = true;
    };
  }, [activeNav]);

  const overviewStats = useMemo(() => {
    const metric = (value, loading, error, errorHint, okHint) => {
      if (loading && value === null) return { value: '…', hint: okHint };
      if (error) return { value: '—', hint: errorHint };
      return { value: String(value ?? 0), hint: okHint };
    };

    const bookings = metric(
      overviewLoad.pendingBookings,
      overviewLoad.loading,
      overviewLoad.errorBookings,
      'Could not load bookings',
      'Needs your decision'
    );
    const incidents = metric(
      overviewLoad.openIncidents,
      overviewLoad.loading,
      overviewLoad.errorTickets,
      'Could not load incidents',
      'OPEN or in progress'
    );
    const catalogue = metric(
      overviewLoad.catalogueCount,
      overviewLoad.loading,
      overviewLoad.errorResources,
      'Could not load resources',
      'Rooms & equipment'
    );

    return [
      { label: 'Pending booking approvals', ...bookings },
      { label: 'Open incident tickets', ...incidents },
      {
        label: 'Registered users',
        value:
          usersError != null
            ? '—'
            : usersLoading && users.length === 0
              ? '…'
              : String(registeredCount),
        hint: usersError ? 'Could not load accounts' : 'All accounts',
      },
      { label: 'Catalogue resources', ...catalogue },
    ];
  }, [
    overviewLoad.loading,
    overviewLoad.pendingBookings,
    overviewLoad.openIncidents,
    overviewLoad.catalogueCount,
    overviewLoad.errorBookings,
    overviewLoad.errorTickets,
    overviewLoad.errorResources,
    registeredCount,
    usersError,
    usersLoading,
    users.length,
  ]);

  const renderMain = () => {
    if (activeNav === 'users') {
      return (
        <AdminUserManagementPanel
          users={users}
          loading={usersLoading}
          error={usersError}
          onRefresh={loadUsers}
          currentUserId={user?.id}
        />
      );
    }
    if (activeNav === 'facilities') {
      return <AdminFacilitiesPanel />;
    }
    if (activeNav === 'bookings') {
      return <BookingManagementPage initialMode="ADMIN" showModeSwitch={false} />;
    }
    if (activeNav === 'incidents') {
      return <TicketsPage scope="all" embeddedInAdmin />;
    }
    if (activeNav === 'security') {
      return <AdminSecurityAlertPanel />;
    }
    if (activeNav === 'overview') {
      return (
        <>
          <section className="dash-hero dash-hero--admin" aria-labelledby="admin-welcome-heading">
            <div className="dash-hero-admin-row">
              <div>
                <h1 id="admin-welcome-heading">Admin Dashboard</h1>
                <p>
                  Oversee campus operations—bookings, incidents, accounts, and resources—from one place.
                </p>
                <div className="dash-hero-meta">
                  <span className="dash-pill">
                    <span>Today</span> <strong>{formatToday()}</strong>
                  </span>
                  <span className="dash-pill dash-pill--admin">
                    <span className="admin-pill-icon" aria-hidden>
                      <IconShield />
                    </span>
                    <span>Full access</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="dash-stats admin-stats admin-overview-stats" aria-label="Campus overview">
            {overviewStats.map((s) => (
              <article key={s.label} className="dash-stat dash-stat--admin">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value-wrap">
                  <div className="dash-stat-value">{s.value}</div>
                </div>
                <div className="dash-stat-hint">{s.hint}</div>
              </article>
            ))}
          </section>

          <section className="dash-panel admin-panel-queue" aria-labelledby="queue-heading">
            <div className="dash-panel-head">
              <h2 id="queue-heading" className="dash-panel-title">
                Priority queue
              </h2>
              <span className="admin-panel-badge">Overview</span>
            </div>
            <p className="admin-panel-lead admin-panel-lead--queue">
              Pending <strong>booking requests</strong> and active <strong>incidents</strong> are combined here by
              urgency. Choose an item to jump to the right tool.
            </p>
            <div className="admin-queue-shell">
              {overviewLoad.loading ? (
                <div className="admin-queue-empty">
                  <span className="admin-queue-empty-icon" aria-hidden>
                    <IconCalendar />
                  </span>
                  <strong>Loading queue…</strong>
                  <span>Fetching bookings and incidents.</span>
                </div>
              ) : overviewLoad.queue.length === 0 ? (
                <div className="admin-queue-empty">
                  <span className="admin-queue-empty-icon" aria-hidden>
                    <IconCalendar />
                  </span>
                  <strong>All clear</strong>
                  <span>No pending approvals or open incidents need attention right now.</span>
                </div>
              ) : (
                <ul className="admin-queue-list" aria-label="Priority actions">
                  {overviewLoad.queue.map((row) => (
                    <li key={row.key}>
                      <button
                        type="button"
                        className="admin-queue-card"
                        onClick={() => setActiveNav(row.navTarget)}
                      >
                        <span className="admin-queue-card-icon" aria-hidden>
                          {row.navTarget === 'bookings' ? <IconCalendar /> : <IconTicket />}
                        </span>
                        <span className="admin-queue-card-body">
                          <span className="admin-queue-card-kicker">
                            <span className="admin-queue-kind">{row.typeLabel}</span>
                            {row.badge ? (
                              <span
                                className={`admin-queue-priority admin-queue-priority--${String(row.badge).toLowerCase()}`}
                              >
                                {row.badge}
                              </span>
                            ) : null}
                          </span>
                          <span className="admin-queue-card-title">{row.summary}</span>
                          {row.subtitle ? <span className="admin-queue-card-desc">{row.subtitle}</span> : null}
                          <span className="admin-queue-card-footer">
                            <span className="admin-queue-card-time">{row.whenLabel}</span>
                            <span
                              className={`admin-queue-status-pill admin-queue-status-pill--${row.navTarget === 'bookings' ? 'booking' : 'incident'}`}
                            >
                              {row.statusLabel}
                            </span>
                          </span>
                        </span>
                        <span className="admin-queue-card-chevron" aria-hidden>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <p className="dash-footnote">
            Everyone uses the same sign-in page. This administrator view is shown only to accounts with the Admin
            role.
          </p>
        </>
      );
    }

    const nav = SIDEBAR_NAV.find((n) => n.id === activeNav);
    return (
      <AdminPlaceholder
        title={nav?.label || 'Section'}
        body="We’ll add tools here in a future update. Use Overview or User management for now."
      />
    );
  };

  return (
    <div className="dash dash--admin admin-shell">
      <header className="dash-topbar">
        <div className="dash-brand">
          <img src={logo} alt="SmartUNI" className="dash-brand-logo" />
        </div>
        <div className="dash-topbar-actions">
          <div className="admin-user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="dash-user admin-user-menu-trigger"
              title={user?.email}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-controls="admin-user-menu-panel"
              id="admin-user-menu-button"
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <span className="dash-avatar dash-avatar--admin" aria-hidden>
                {initials(user?.name || user?.email || 'A')}
              </span>
              <span className="dash-user-meta">
                <span className="dash-user-name">{user?.name || 'Admin'}</span>
                <span className="dash-role">ADMIN</span>
              </span>
              <span className="admin-user-menu-chevron" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {userMenuOpen ? (
              <div
                id="admin-user-menu-panel"
                className="admin-user-menu-dropdown"
                role="menu"
                aria-labelledby="admin-user-menu-button"
              >
                <button
                  type="button"
                  className="admin-user-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="admin-shell-body">
        <aside className="admin-sidebar-wrap" aria-label="Admin navigation">
          <nav className="admin-sidebar">
            <p className="admin-sidebar-heading">Menu</p>
            <ul className="admin-nav-list">
              {SIDEBAR_NAV.map(({ id, label, sub, Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    className={`admin-nav-item${activeNav === id ? ' admin-nav-item--active' : ''}`}
                    onClick={() => setActiveNav(id)}
                  >
                    <span className="admin-nav-icon" aria-hidden>
                      <Icon />
                    </span>
                    <span className="admin-nav-text">
                      <span className="admin-nav-label">{label}</span>
                      <span className="admin-nav-sub">{sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="dash-main admin-main-area">{renderMain()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
