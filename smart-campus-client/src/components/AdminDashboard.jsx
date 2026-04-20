import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import logo from '../assets/logo.png';
import AdminUserManagementPanel from './AdminUserManagementPanel';
import './DashboardShell.css';
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

const IconChart = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
  { id: 'reports', label: 'Reports', sub: 'Insights', Icon: IconChart },
  { id: 'security', label: 'Security & audit', sub: 'Logs', Icon: IconShield },
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

  const registeredCount = users.length;

  const overviewStats = [
    { label: 'Pending booking approvals', value: '—', hint: 'Needs your decision' },
    { label: 'Open incident tickets', value: '—', hint: 'Across campus' },
    {
      label: 'Registered users',
      value:
        usersError != null
          ? '—'
          : usersLoading && users.length === 0
            ? '…'
            : String(registeredCount),
      hint: 'All accounts',
    },
    { label: 'Catalogue resources', value: '—', hint: 'Rooms & equipment' },
  ];

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

          <section className="dash-stats admin-stats" aria-label="Campus overview">
            {overviewStats.map((s) => (
              <article key={s.label} className="dash-stat dash-stat--admin">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value">{s.value}</div>
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
            <p className="admin-panel-lead">
              Pending approvals, escalations, and other urgent items will appear in this list.
            </p>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Summary</th>
                    <th>When</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="dash-table-empty-row">
                    <td colSpan={4}>
                      <div className="dash-table-empty">
                        <span className="dash-table-empty-icon" aria-hidden>
                          <IconCalendar />
                        </span>
                        <strong>Nothing waiting</strong>
                        <span>New items will show here when there is something that needs your attention.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
          <div className="dash-user" title={user?.email}>
            <span className="dash-avatar dash-avatar--admin" aria-hidden>
              {initials(user?.name || user?.email || 'A')}
            </span>
            <div className="dash-user-meta">
              <span className="dash-user-name">{user?.name || 'Admin'}</span>
              <span className="dash-role">ADMIN</span>
            </div>
          </div>
          <button type="button" className="dash-btn-logout" onClick={logout}>
            Log out
          </button>
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
