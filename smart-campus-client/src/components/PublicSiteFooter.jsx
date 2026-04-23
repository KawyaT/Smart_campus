import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './PublicSiteFooter.css';

export default function PublicSiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-brand">
          <img src={logo} alt="" className="public-footer-logo" width={120} height={36} />
          <p className="public-footer-tagline">
            Smart campus operations for bookings, facilities, and maintenance — one connected platform.
          </p>
        </div>
        <div className="public-footer-col">
          <h3 className="public-footer-heading">Explore</h3>
          <ul className="public-footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="public-footer-col">
          <h3 className="public-footer-heading">Account</h3>
          <ul className="public-footer-links">
            <li>
              <Link to="/login">Sign in</Link>
            </li>
            <li>
              <Link to="/register">Create account</Link>
            </li>
          </ul>
        </div>
        <div className="public-footer-col">
          <h3 className="public-footer-heading">Contact</h3>
          <p className="public-footer-contact">
            <span className="public-footer-label">Email</span>
            <a href="mailto:support@smartuni.lk">support@smartuni.lk</a>
          </p>
          <p className="public-footer-contact">
            <span className="public-footer-label">Campus</span>
            <span>SmartUni Main Campus</span>
          </p>
        </div>
      </div>
      <div className="public-footer-bottom">
        <p>© {new Date().getFullYear()} SmartUni. All rights reserved.</p>
      </div>
    </footer>
  );
}
