import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { notificationsAPI } from '../api/notifications';

const MAX_LEN = 2000;

function formatSentAt(value) {
  if (value == null) return '—';
  try {
    let d;
    if (value instanceof Date) {
      d = value;
    } else if (Array.isArray(value) && value.length >= 3) {
      const [y, mo, day, h = 0, mi = 0, s = 0, nano = 0] = value;
      d = new Date(y, mo - 1, day, h, mi, Math.floor(s), Math.floor((nano || 0) / 1e6));
    } else {
      d = new Date(value);
    }
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

export default function AdminSecurityAlertPanel() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const trimmed = message.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LEN && !sending;

  const loadBroadcasts = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await notificationsAPI.listBroadcasts();
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load notice history.');
      setBroadcasts([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      const data = await notificationsAPI.broadcastSystem(trimmed);
      const n = typeof data?.sentToUsers === 'number' ? data.sentToUsers : 0;
      setMessage('');
      toast.success(`Notice delivered to ${n} user${n === 1 ? '' : 's'}.`);
      await loadBroadcasts();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Could not send notice.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(batch) {
    const ok = window.confirm(
      'Remove this notice from history and delete it from every user’s notification bell?\n\nUsers will no longer see this message.',
    );
    if (!ok) return;
    setDeletingId(batch.id);
    try {
      await notificationsAPI.deleteBroadcastBatch(batch.id);
      toast.success('Notice removed.');
      await loadBroadcasts();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not delete notice.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-page admin-notices-page admin-shell-unified admin-main-tab-enter">
      <section className="admin-users-hero" aria-labelledby="notices-hero-title">
        <div className="admin-users-hero-inner">
          <div className="admin-users-hero-copy">
            <span className="admin-users-hero-kicker">Campus communications</span>
            <h1 id="notices-hero-title" className="admin-users-hero-title">
              Notices
            </h1>
            <p className="admin-users-hero-lead">
              Reach every account with a <strong>SYSTEM</strong> alert. Delivered only in-app.
            </p>
          </div>
          <div className="admin-users-hero-accent" aria-hidden>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="56" height="56">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </div>
      </section>

      <div className="admin-notices-layout">
        <section className="admin-notices-compose">
          <h2 className="admin-users-table-title">Compose notice</h2>
          <div className="admin-security-alert-card admin-notices-card">
            <form className="admin-security-alert-form" onSubmit={handleSubmit}>
              <label htmlFor="admin-security-message" className="admin-security-alert-label">
                Message
              </label>
              <textarea
                id="admin-security-message"
                className="admin-security-alert-textarea"
                rows={6}
                maxLength={MAX_LEN}
                placeholder="Type your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                aria-describedby="admin-security-hint admin-security-count"
              />
              <div className="admin-security-alert-meta">
                <span id="admin-security-hint" className="admin-security-alert-hint">
                  Sends as type <strong>SYSTEM</strong> to <strong>all registered users</strong>.
                </span>
                <span id="admin-security-count" className="admin-security-alert-count" aria-live="polite">
                  {message.length} / {MAX_LEN}
                </span>
              </div>

              <div className="admin-security-alert-actions">
                <button type="submit" className="admin-security-alert-submit" disabled={!canSend}>
                  {sending ? 'Sending…' : 'Send to all users'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="admin-notices-history" aria-labelledby="sent-notices-heading">
          <div className="admin-notices-history-head">
            <h2 id="sent-notices-heading" className="admin-users-table-title">
              Sent notices
            </h2>
            <span className="admin-notices-history-count">{broadcasts.length} saved</span>
          </div>

          {historyLoading ? (
            <div className="admin-notices-empty admin-notices-empty--loading">Loading history…</div>
          ) : broadcasts.length === 0 ? (
            <div className="admin-notices-empty">
              <span className="admin-notices-empty-icon" aria-hidden>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="40" height="40">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.25}
                    d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v13l4-4h10a2 2 0 002-2v-1"
                  />
                </svg>
              </span>
              <strong>No notices yet</strong>
              <span>When you send one, it will appear here so you can review or remove it from everyone’s bells.</span>
            </div>
          ) : (
            <ul className="admin-notices-list">
              {broadcasts.map((b) => (
                <li key={b.id}>
                  <article className="admin-notice-card">
                    <div className="admin-notice-card-main">
                      <span className="admin-notice-badge">SYSTEM</span>
                      <p className="admin-notice-text">{b.message}</p>
                      <div className="admin-notice-meta">
                        <span>{formatSentAt(b.createdAt)}</span>
                        <span className="admin-notice-meta-dot" aria-hidden>
                          ·
                        </span>
                        <span>
                          {b.recipientCount} recipient{b.recipientCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="admin-notice-delete"
                      title="Delete this notice for everyone"
                      aria-label="Delete notice"
                      disabled={deletingId === b.id}
                      onClick={() => handleDelete(b)}
                    >
                      {deletingId === b.id ? (
                        <span className="admin-notice-delete-busy">…</span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
