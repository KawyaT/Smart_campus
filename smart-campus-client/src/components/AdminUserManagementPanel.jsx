import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../api/users';
import './AdminUserManagementPanel.css';

function formatProvider(p) {
  if (p === 'GOOGLE') return 'Google';
  return 'Email';
}

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
      <div className="admin-page">
        <p className="admin-page-lead">Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
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
    <div className="admin-page">
      <header className="admin-page-head">
        <h1 className="admin-page-title">User management</h1>
      </header>

      <div className="admin-user-stats" aria-label="User summary">
        <div className="admin-user-stat">
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

      <div className="dash-table-wrap admin-user-table-wrap">
        <table className="dash-table dash-table--users">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Sign-in</th>
              <th className="admin-user-col-actions"> </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isSelf = row.id === currentUserId;
              const busy = deletingId === row.id;
              return (
                <tr key={row.id}>
                  <td>
                    <span className="admin-user-name">{row.name || '—'}</span>
                  </td>
                  <td>
                    <span className="admin-user-email">{row.email}</span>
                  </td>
                  <td>{formatProvider(row.authProvider)}</td>
                  <td className="admin-user-actions-cell">
                    <button
                      type="button"
                      className="admin-btn-delete"
                      disabled={isSelf || busy}
                      title={isSelf ? 'You cannot delete your own account' : 'Remove this user'}
                      onClick={() => handleDelete(row.id)}
                    >
                      {busy ? 'Removing…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagementPanel;
