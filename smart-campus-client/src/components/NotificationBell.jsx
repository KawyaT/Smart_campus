import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { notificationsAPI } from '../api/notifications';

const FILTERS = [
  { value: 'ALL', label: 'All types' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'TICKET', label: 'Ticket' },
  { value: 'SYSTEM', label: 'System' },
];

const MUTED_STORAGE_KEY = 'smartcampus:notificationsMuted';

function readMuted() {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistMuted(value) {
  try {
    if (value) {
      localStorage.setItem(MUTED_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(MUTED_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

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
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const IconTickAll = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

/** Bell + slash — indicates alerts are muted / “click to mute” in panel */
const IconBellMuted = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083a6.002 6.002 0 00-5 5.917v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4l16 16" />
  </svg>
);

const DEFAULT_POLL_MS = 10000;

/**
 * Header bell: badge count, dropdown with list, mark read, delete, type filter.
 * @param {{ onUnreadChange?: (n: number) => void, pollIntervalMs?: number }} props
 */
export default function NotificationBell({ onUnreadChange, pollIntervalMs = DEFAULT_POLL_MS }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [unread, setUnread] = useState(0);
  const [muted, setMuted] = useState(readMuted);
  const [markAllBusy, setMarkAllBusy] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);

  const displayUnread = muted ? 0 : unread;

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await notificationsAPI.unreadCount();
      const n = typeof count === 'number' ? count : 0;
      setUnread(n);
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    onUnreadChange?.(displayUnread);
  }, [displayUnread, onUnreadChange]);

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
    const ms = pollIntervalMs > 0 ? pollIntervalMs : DEFAULT_POLL_MS;
    const id = setInterval(refreshCount, ms);
    return () => clearInterval(id);
  }, [refreshCount, pollIntervalMs]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshCount();
      }
    };
    const onFocus = () => refreshCount();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshCount]);

  useEffect(() => {
    refreshCount();
  }, [location.pathname, refreshCount]);

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

  async function handleMarkAllRead() {
    if (unread === 0 || markAllBusy) return;
    setMarkAllBusy(true);
    setError(null);
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshCount();
    } catch {
      setError('Could not mark all as read');
    } finally {
      setMarkAllBusy(false);
    }
  }

  return (
    <div className="dash-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dash-bell-btn${muted ? ' dash-bell-btn--muted' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={muted ? 'Notifications (muted)' : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
      >
        {muted ? <IconBellMuted /> : <IconBell />}
        {!muted && unread > 0 && (
          <span className="dash-bell-badge" aria-hidden>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="dash-bell-panel" role="dialog" aria-label="Notifications list">
          <div className="dash-bell-panel-head">
            <h3>Notifications</h3>
            <div className="dash-bell-panel-head-actions">
              <button
                type="button"
                className="dash-bell-markall-btn"
                onClick={handleMarkAllRead}
                disabled={unread === 0 || markAllBusy}
                title={unread === 0 ? 'No unread notifications' : 'Mark all as read'}
                aria-label="Mark all notifications as read"
              >
                <IconTickAll />
              </button>
              <button
                type="button"
                className={`dash-bell-mute-btn${muted ? ' dash-bell-mute-btn--active' : ''}`}
                onClick={() => {
                  setMuted((m) => {
                    const next = !m;
                    persistMuted(next);
                    return next;
                  });
                }}
                aria-pressed={muted}
                title={muted ? 'Unmute — show unread counts and alerts' : 'Mute — hide badge and unread count'}
              >
                {muted ? <IconBell /> : <IconBellMuted />}
                <span className="dash-bell-mute-label">{muted ? 'Unmute' : 'Mute'}</span>
              </button>
              <select
                className="dash-bell-filter"
                value={FILTERS.some((f) => f.value === filter) ? filter : 'ALL'}
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
          </div>
          {muted && (
            <p className="dash-bell-muted-hint">Muted: unread counts are hidden until you unmute.</p>
          )}
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
