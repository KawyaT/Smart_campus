import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const nav = [
  { label: 'Facilities', path: '/resources', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { label: 'Bookings',   path: '/bookings',  icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
  { label: 'Tickets',    path: '/tickets',   icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14 2zM14 2v6h6' },
  { label: 'Notifications', path: '/notifications', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: '220px', background: '#0d1117',
      borderRight: '1px solid #1e2736',
      padding: '24px 16px', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', padding: '0 8px' }}>
        <img
            src="/favicon.png"
            alt="SmartCampus"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
        />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>SmartCampus</div>
          <div style={{ fontSize: '10px', color: '#4b6a9b' }}>Operations Hub</div>
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#4b6a9b', letterSpacing: '.08em', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>
        Main
      </div>

      {nav.map(item => {
        const active = location.pathname === item.path;
        return (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', marginBottom: '2px',
            cursor: 'pointer',
            background: active ? '#1a2740' : 'transparent',
            color: active ? '#fff' : '#8899b4',
            fontSize: '13px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={item.icon} />
            </svg>
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
