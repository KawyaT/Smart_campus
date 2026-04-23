import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../api/users';
import './AdminUserManagementPanel.css';

function formatProvider(p) {
  if (p === 'GOOGLE') return 'Google';
  return 'Email';
}

function roleLabel(role) {
  const r = (role || 'USER').toString().toUpperCase();
  if (r === 'ADMIN') return 'Admin';
  if (r === 'TECHNICIAN') return 'Technician';
  return 'User';
}

const IconUsersHero = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden width="56" height="56">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const AdminUserManagementPanel = ({ users, loading, error, onRefresh, currentUserId }) => {
  const [deletingId, setDeletingId] = useState(null);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const an = (a.name || a.email || '').toLowerCase();
      const bn = (b.name || b.email || '').toLowerCase();
      return an.localeCompare(bn);
    });
  }, [users]);

  const stats = useMemo(() => {
    let staff = 0;
    let admins = 0;
    users.forEach((u) => {
      if (u.role === 'ADMIN') admins += 1;
      else staff += 1;
    });
    return { total: users.length, staff, admins };
  }, [users]);

  const handleDelete = async (userId) => {
    if (userId === currentUserId) return;
    const u = users.find((x) => x.id === userId);
    if (!u) return;
    const ok = window.confirm(
      `Remove ${u.name || u.email} (${u.email}) from SmartUNI?\n\nThis cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(userId);
    try {
      await usersAPI.deleteUser(userId);
      toast.success('User removed');
      await onRefresh();
    } catch (e) {
      const d = e.response?.data;
      const msg =
        typeof d === 'string'
          ? d
          : d?.message || e.message || 'Could not delete user';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-page admin-users-page admin-shell-unified admin-main-tab-enter">
        <p className="admin-users-loading-msg">Loading directory…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page admin-users-page admin-shell-unified admin-main-tab-enter">
        <div className="admin-inline-msg admin-inline-msg--error" role="alert">
          {error}
        </div>
        <button type="button" className="admin-btn-secondary" onClick={() => onRefresh()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page admin-users-page admin-shell-unified admin-main-tab-enter">
      <section className="admin-users-hero" aria-labelledby="users-hero-title">
        <div className="admin-users-hero-inner">
          <div className="admin-users-hero-copy">
            <span className="admin-users-hero-kicker">Directory</span>
            <h1 id="users-hero-title" className="admin-users-hero-title">
              User management
            </h1>
            <p className="admin-users-hero-lead">
              Search and maintain campus accounts. Removing a user revokes access immediately.
            </p>
          </div>
          <div className="admin-users-hero-accent" aria-hidden>
            <IconUsersHero />
          </div>
        </div>
      </section>

      <div className="admin-users-shell">
        <div className="admin-user-stats" aria-label="User summary">
          <div className="admin-user-stat admin-user-stat--accent">
            <span className="admin-user-stat-value">{stats.total}</span>
            <span className="admin-user-stat-label">Registered</span>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-value">{stats.staff}</span>
            <span className="admin-user-stat-label">Students & staff</span>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-value">{stats.admins}</span>
            <span className="admin-user-stat-label">Administrators</span>
          </div>
        </div>

        <div className="admin-users-table-card">
          <div className="admin-users-table-head">
            <h2 className="admin-users-table-title">All accounts</h2>
            <span className="admin-users-table-caption">{sorted.length} shown</span>
          </div>
          <div className="dash-table-wrap admin-user-table-wrap">
            <table className="dash-table dash-table--users">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Sign-in</th>
                  <th className="admin-user-col-actions"> </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const isSelf = row.id === currentUserId;
                  const busy = deletingId === row.id;
                  const r = (row.role || 'USER').toString().toLowerCase();
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="admin-user-cell-name">
                          <span className="admin-user-avatar" aria-hidden>
                            {(row.name || row.email || '?').trim().slice(0, 1).toUpperCase()}
                          </span>
                          <span className="admin-user-name">{row.name || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role-pill admin-role-pill--${r}`}>{roleLabel(row.role)}</span>
                      </td>
                      <td>
                        <span className="admin-user-email">{row.email}</span>
                      </td>
                      <td>
                        <span className="admin-user-provider">{formatProvider(row.authProvider)}</span>
                      </td>
                      <td className="admin-user-actions-cell">
                        <button
                          type="button"
                          className="admin-btn-delete-icon"
                          disabled={isSelf || busy}
                          title={isSelf ? 'You cannot delete your own account' : 'Remove user'}
                          onClick={() => handleDelete(row.id)}
                          aria-label={busy ? 'Removing…' : `Remove ${row.email}`}
                        >
                          {busy ? (
                            <span className="admin-btn-delete-spinner">…</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagementPanel;
