import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { notificationsAPI } from '../api/notifications';
import logo from '../assets/logo.png';
import NotificationBell from './NotificationBell';
import './DashboardShell.css';
import './UserDashboard.css';

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

const IconBell = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconWrench = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconBuilding = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

const QUICK_BY_ROLE = {
  USER: [
    { title: 'Book a resource', desc: 'Rooms, labs, equipment', Icon: IconBuilding },
    { title: 'My bookings', desc: 'Upcoming and past', Icon: IconCalendar },
    { title: 'Report an issue', desc: 'Maintenance & incidents', Icon: IconTicket },
    { title: 'Notifications', desc: 'Alerts and updates', Icon: IconBell },
  ],
  TECHNICIAN: [
    { title: 'My assignments', desc: 'Tickets assigned to you', Icon: IconTicket },
    { title: 'Update status', desc: 'Progress and resolution', Icon: IconWrench },
    { title: 'Resource check', desc: 'Facility status', Icon: IconBuilding },
    { title: 'Notifications', desc: 'New work and comments', Icon: IconBell },
  ],
};

const STATS_BY_ROLE = {
  USER: [
    { label: 'My bookings', value: '—', hint: 'Upcoming sessions' },
    { label: 'My tickets', value: '—', hint: 'Open & in progress' },
    { label: 'Unread alerts', value: '—', hint: 'Notifications' },
  ],
  TECHNICIAN: [
    { label: 'Assigned', value: '—', hint: 'Your queue' },
    { label: 'In progress', value: '—', hint: 'Active work' },
    { label: 'Resolved today', value: '—', hint: 'Completed tickets' },
  ],
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState(null);
  const [nameEdit, setNameEdit] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [deletePanelOpen, setDeletePanelOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setNameEdit(user?.name || '');
  }, [user?.name, user?.id]);

  useEffect(() => {
    let cancelled = false;
    authAPI
      .getMe()
      .then((me) => {
        if (!cancelled) setAuthProvider(me.authProvider || 'LOCAL');
      })
      .catch(() => {
        if (!cancelled) setAuthProvider(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const onUnreadChange = useCallback((n) => {
    setUnreadAlerts(n);
  }, []);

  useEffect(() => {
    let cancelled = false;
    function load() {
      notificationsAPI
        .unreadCount()
        .then((d) => {
          if (!cancelled) setUnreadAlerts(typeof d.count === 'number' ? d.count : 0);
        })
        .catch(() => {
          if (!cancelled) setUnreadAlerts(null);
        });
    }
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const role = user?.role || 'USER';
  const quickActions = QUICK_BY_ROLE[role] || QUICK_BY_ROLE.USER;
  const statsBase = STATS_BY_ROLE[role] || STATS_BY_ROLE.USER;
  const stats = useMemo(() => {
    if (role !== 'USER' && role !== 'TECHNICIAN') return statsBase;
    return statsBase.map((s) =>
      s.label === 'Unread alerts' || s.hint === 'Notifications'
        ? { ...s, value: unreadAlerts === null ? '—' : String(unreadAlerts) }
        : s
    );
  }, [statsBase, role, unreadAlerts]);

  const welcomeLine = useMemo(() => {
    if (role === 'TECHNICIAN') return 'Pick up assignments, update ticket status, and keep facilities running smoothly.';
    return 'Book resources, report issues, and stay on top of campus updates.';
  }, [role]);

  const nameDirty = nameEdit.trim() !== (user?.name || '').trim();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameDirty || savingProfile) return;
    setSavingProfile(true);
    try {
      await updateProfile({ name: nameEdit.trim() });
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteEmailMatches = deleteEmailInput.trim() === (user?.email || '');

  const handleDeleteAccount = async () => {
    if (!deleteEmailMatches || deletingAccount) return;
    setDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        navigate('/login', { replace: true });
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const signInLabel = authProvider === 'GOOGLE' ? 'Google' : 'Email & password';

  return (
    <div className="dash dash--user">
      <header className="dash-topbar">
        <div className="dash-brand">
          <img src={logo} alt="SmartUNI" className="dash-brand-logo" />
        </div>
        <div className="dash-topbar-actions">
          <NotificationBell onUnreadChange={onUnreadChange} />
          <div className="dash-user" title={user?.email}>
            <span className="dash-avatar" aria-hidden>
              {initials(user?.name || user?.email || 'U')}
            </span>
            <div className="dash-user-meta">
              <span className="dash-user-name">{user?.name || 'User'}</span>
              <span className="dash-role">{role}</span>
            </div>
          </div>
          <button type="button" className="dash-btn-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-hero" aria-labelledby="dash-welcome-heading">
          <h1 id="dash-welcome-heading">Hello, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p>{welcomeLine}</p>
          <div className="dash-hero-meta">
            <span className="dash-pill">
              <span>Today</span> <strong>{formatToday()}</strong>
            </span>
            <span className="dash-pill">
              Signed in as <strong>{role}</strong>
            </span>
          </div>
        </section>

        <section className="dash-stats" aria-label="Summary">
          {stats.map((s) => (
            <article key={s.label} className="dash-stat">
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-hint">{s.hint}</div>
            </article>
          ))}
        </section>

        <div className="dash-grid">
          <section className="dash-panel user-profile-panel" aria-labelledby="profile-heading">
            <div className="dash-panel-head">
              <h2 id="profile-heading" className="dash-panel-title">
                Your profile
              </h2>
            </div>
            <p className="user-profile-hint">
              Update how your name appears on SmartUNI. Email and role cannot be changed here. You signed in with{' '}
              <strong>{signInLabel}</strong>.
            </p>
            <form className="user-profile-form" onSubmit={handleSaveProfile}>
              <div className="user-form-field">
                <label htmlFor="profile-name">Display name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="user-form-input"
                  value={nameEdit}
                  onChange={(ev) => setNameEdit(ev.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  placeholder="Your name"
                />
              </div>
              <div className="user-form-field user-form-field--readonly">
                <span className="user-form-label">Email</span>
                <span className="user-form-readonly">{user?.email || '—'}</span>
              </div>
              <div className="user-form-field user-form-field--readonly">
                <span className="user-form-label">Role</span>
                <span className="user-form-readonly">{role}</span>
              </div>
              <div className="user-form-field user-form-field--readonly">
                <span className="user-form-label">User ID</span>
                <span className="user-form-readonly user-form-mono">{user?.id || '—'}</span>
              </div>
              <div className="user-form-actions">
                <button
                  type="submit"
                  className="user-btn-primary"
                  disabled={!nameDirty || savingProfile}
                >
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>

            <div className="user-danger-zone">
              <h3 className="user-danger-title">Delete account</h3>
              <p className="user-danger-text">
                Permanently delete your SmartUNI account and profile data. This cannot be undone.
              </p>
              {!deletePanelOpen ? (
                <button
                  type="button"
                  className="user-btn-danger-outline"
                  onClick={() => {
                    setDeletePanelOpen(true);
                    setDeleteEmailInput('');
                  }}
                >
                  Delete my account…
                </button>
              ) : (
                <div className="user-delete-panel">
                  <p className="user-delete-warning">
                    Type your email address below to confirm. You will be signed out immediately.
                  </p>
                  <input
                    type="email"
                    className="user-form-input user-delete-email-input"
                    value={deleteEmailInput}
                    onChange={(ev) => setDeleteEmailInput(ev.target.value)}
                    placeholder={user?.email || 'your@email.com'}
                    autoComplete="off"
                    aria-label="Confirm email to delete account"
                  />
                  <div className="user-delete-actions">
                    <button
                      type="button"
                      className="user-btn-ghost"
                      onClick={() => {
                        setDeletePanelOpen(false);
                        setDeleteEmailInput('');
                      }}
                      disabled={deletingAccount}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="user-btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={!deleteEmailMatches || deletingAccount}
                    >
                      {deletingAccount ? 'Deleting…' : 'Permanently delete account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="dash-panel" aria-labelledby="actions-heading">
            <div className="dash-panel-head">
              <h2 id="actions-heading" className="dash-panel-title">
                Quick actions
              </h2>
            </div>
            <div className="dash-actions">
              {quickActions.map((action) => {
                const ActionIcon = action.Icon;
                return (
                  <button key={action.title} type="button" className="dash-action">
                    <span className="dash-action-icon">
                      <ActionIcon />
                    </span>
                    <span className="dash-action-body">
                      <span className="dash-action-title">{action.title}</span>
                      <span className="dash-action-desc">{action.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <p className="dash-footnote">
          Smart Campus — your hub for facilities, bookings, and maintenance.
        </p>
      </main>
    </div>
  );
};

export default UserDashboard;
