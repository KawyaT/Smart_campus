import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import NotificationBell from './NotificationBell';
import UserProfileModal from './UserProfileModal';
import PublicSiteFooter from './PublicSiteFooter';
import './DashboardShell.css';
import './UserDashboard.css';

function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const HEADER_NAV = [
  { to: '/user-dashboard', label: 'Dashboard', end: true },
  { to: '/user-dashboard/book-resource', label: 'Book a resource' },
  { to: '/user-dashboard/my-bookings', label: 'My bookings' },
  { to: '/user-dashboard/report-issue', label: 'Report an Issue' },
];

const UserDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || 'USER';
  const [unreadAlerts, setUnreadAlerts] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onDoc = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  return (
    <div className="dash dash--user user-app-shell">
      <header className="dash-topbar user-dash-topbar">
        <div className="user-topbar-inner">
          <div className="dash-brand">
            <img src={logo} alt="SmartUNI" className="dash-brand-logo" />
          </div>
          <nav className="user-header-nav" aria-label="Main navigation">
            {HEADER_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `user-nav-link${isActive ? ' user-nav-link--active' : ''}`}
                onClick={() => setUserMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="dash-topbar-actions user-topbar-actions">
            <NotificationBell onUnreadChange={setUnreadAlerts} pollIntervalMs={8000} />
            <div className="user-account-menu" ref={userMenuRef}>
              <button
                type="button"
                className="dash-user user-account-trigger"
                title={user?.email}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-controls="user-account-menu-panel"
                id="user-account-menu-button"
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <span className="dash-avatar" aria-hidden>
                  {initials(user?.name || user?.email || 'U')}
                </span>
                <span className="dash-user-meta">
                  <span className="dash-user-name">{user?.name || 'User'}</span>
                  <span className="dash-role">{role}</span>
                </span>
                <span className="user-account-chevron" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {userMenuOpen ? (
                <div
                  id="user-account-menu-panel"
                  className="user-account-dropdown"
                  role="menu"
                  aria-labelledby="user-account-menu-button"
                >
                  <button
                    type="button"
                    className="user-account-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setProfileOpen(true);
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="user-account-menu-item user-account-menu-item--danger"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/', { replace: true });
                      logout();
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <div className="user-dashboard-outlet-wrap">
        <div key={location.pathname} className="user-shell-tab-enter">
          <Outlet context={{ unreadAlerts }} />
        </div>
      </div>

      <PublicSiteFooter />
    </div>
  );
};

export default UserDashboardLayout;
