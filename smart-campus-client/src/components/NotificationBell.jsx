import React, { useCallback, useEffect, useRef, useState } from 'react';
import { notificationsAPI } from '../api/notifications';

const FILTERS = [
  { value: 'ALL', label: 'All types' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'TICKET', label: 'Ticket' },
  { value: 'COMMENT', label: 'Comment' },
  { value: 'SYSTEM', label: 'System' },
];

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return '';
  }
}

const IconBell = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

/**
 * Header bell: badge count, dropdown with list, mark read, delete, type filter.
 * @param {{ onUnreadChange?: (n: number) => void }} props
 */
export default function NotificationBell({ onUnreadChange }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await notificationsAPI.unreadCount();
      const n = typeof count === 'number' ? count : 0;
      setUnread(n);
      onUnreadChange?.(n);
    } catch {
      setUnread(0);
      onUnreadChange?.(0);
    }
  }, [onUnreadChange]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsAPI.list(filter === 'ALL' ? undefined : filter);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 45000);
    return () => clearInterval(id);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return undefined;
    loadList();
    const id = setInterval(loadList, 30000);
    return () => clearInterval(id);
  }, [open, filter, loadList]);

  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function handleMarkRead(id) {
    try {
      await notificationsAPI.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await refreshCount();
    } catch {
      setError('Could not update notification');
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await notificationsAPI.remove(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      await refreshCount();
    } catch {
      setError('Could not delete notification');
    }
  }

  return (
    <div className="dash-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="dash-bell-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <IconBell />
        {unread > 0 && (
          <span className="dash-bell-badge" aria-hidden>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="dash-bell-panel" role="dialog" aria-label="Notifications list">
          <div className="dash-bell-panel-head">
            <h3>Notifications</h3>
            <select
              className="dash-bell-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by type"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="dash-bell-error">{error}</p>}
          <div className="dash-bell-list">
            {loading && items.length === 0 && (
              <p className="dash-bell-empty">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <p className="dash-bell-empty">No notifications yet.</p>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className={`dash-bell-item ${n.isRead ? '' : 'dash-bell-item--unread'}`}
                role="button"
                tabIndex={0}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!n.isRead) handleMarkRead(n.id);
                  }
                }}
              >
                {!n.isRead && <span className="dash-notify-dot" aria-hidden />}
                <div className="dash-bell-item-body">
                  <span className="dash-bell-type">{n.type || '—'}</span>
                  <p className="dash-bell-msg">{n.message}</p>
                  <time>{formatTime(n.createdAt)}</time>
                </div>
                <button
                  type="button"
                  className="dash-bell-delete"
                  aria-label="Delete notification"
                  onClick={(e) => handleDelete(n.id, e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
