import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import PublicSiteFooter from '../../components/PublicSiteFooter';
import '../../styles/PublicSite.css';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About us' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact us' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="public-shell">
      <header className="public-topbar">
        <div className="public-topbar-inner">
          <Link to="/" className="public-brand" aria-label="SmartUni home">
            <img src={logo} alt="" className="public-brand-logo" width={160} height={48} />
          </Link>

          <nav id="public-nav-menu" className={`public-nav${menuOpen ? ' public-nav--open' : ''}`} aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `public-nav-link${isActive ? ' public-nav-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-topbar-trailing">
            <Link to="/login" className="public-login-link" aria-label="Login or sign up" title="Login / Sign up">
              <span className="public-login-icon-wrap" aria-hidden>
                <svg className="public-login-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              <span className="public-login-link-text">
                <span className="public-login-link-strong">Login</span>
                <span className="public-login-link-sep">/</span>
                <span className="public-login-link-soft">Sign up</span>
              </span>
            </Link>

            <button
              type="button"
              className="public-nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="public-nav-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="public-nav-toggle-bar" />
              <span className="public-nav-toggle-bar" />
              <span className="public-nav-toggle-bar" />
              <span className="public-sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <PublicSiteFooter />
    </div>
  );
}
