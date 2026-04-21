import React, { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userDashboardHero from '../../assets/user-dashboard-hero.jpg';

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
    { title: 'Book a resource', desc: 'Rooms, labs, equipment', Icon: IconBuilding, to: '/user-dashboard/book-resource' },
    { title: 'My bookings', desc: 'Upcoming and past', Icon: IconCalendar, to: '/user-dashboard/my-bookings' },
    { title: 'Report an issue', desc: 'Maintenance & incidents', Icon: IconTicket, to: '/user-dashboard/report-issue' },
    { title: 'Notifications', desc: 'Alerts and updates', Icon: IconBell, to: '/user-dashboard' },
  ],
  TECHNICIAN: [
    { title: 'My assignments', desc: 'Tickets assigned to you', Icon: IconTicket, to: '/user-dashboard/report-issue' },
    { title: 'Update status', desc: 'Progress and resolution', Icon: IconWrench, to: '/user-dashboard/report-issue' },
    { title: 'Resource check', desc: 'Facility status', Icon: IconBuilding, to: '/user-dashboard/book-resource' },
    { title: 'Notifications', desc: 'New work and comments', Icon: IconBell, to: '/user-dashboard' },
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

const UserDashboardHome = () => {
  const { user } = useAuth();
  const { unreadAlerts } = useOutletContext() || {};

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

  return (
    <main className="dash-main user-dashboard-main">
      <section
        className="user-home-hero"
        aria-labelledby="user-home-welcome-heading"
        style={{ '--user-dashboard-hero-url': `url(${userDashboardHero})` }}
      >
        <div className="user-home-hero-inner-wrap">
          <div className="user-home-hero-inner">
            <h1 id="user-home-welcome-heading">Hello, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p>{welcomeLine}</p>
            <div className="user-home-hero-meta">
              <span className="dash-pill user-home-pill">
                <span>Today</span> <strong>{formatToday()}</strong>
              </span>
              <span className="dash-pill user-home-pill">
                Signed in as <strong>{role}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="user-dashboard-body">
        <section className="dash-stats user-home-stats" aria-label="Summary">
          {stats.map((s) => (
            <article key={s.label} className="dash-stat user-home-stat">
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-hint">{s.hint}</div>
            </article>
          ))}
        </section>

        <section className="dash-panel user-home-actions-panel" aria-labelledby="user-home-actions-heading">
          <div className="dash-panel-head">
            <h2 id="user-home-actions-heading" className="dash-panel-title">
              Quick actions
            </h2>
          </div>
          <div className="user-quick-cards" role="list">
            {quickActions.map((action) => {
              const ActionIcon = action.Icon;
              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className="user-quick-card"
                  role="listitem"
                >
                  <span className="user-quick-card-icon" aria-hidden>
                    <ActionIcon />
                  </span>
                  <span className="user-quick-card-title">{action.title}</span>
                  <span className="user-quick-card-desc">{action.desc}</span>
                  <span className="user-quick-card-arrow" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="dash-footnote user-home-footnote">Smart Campus — your hub for facilities, bookings, and maintenance.</p>
      </div>
    </main>
  );
};

export default UserDashboardHome;
