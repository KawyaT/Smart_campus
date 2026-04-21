import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

const typeConfig = {
  LAB:          { label: 'Lab', iconPath: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' },
  LECTURE_HALL: { label: 'Lecture hall', iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  MEETING_ROOM: { label: 'Meeting room', iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z' },
  EQUIPMENT:    { label: 'Equipment', iconPath: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
};

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5);
};

const formatDay = (day) => {
  return day.charAt(0) + day.slice(1).toLowerCase();
};

export default function ResourceDetailModal({ resource, onClose, onEdit, isAdmin }) {
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const cfg = typeConfig[resource.type] || typeConfig.EQUIPMENT;
  const isActive = resource.status === 'ACTIVE';

  const typeColor = {
    LAB:          { bg: isDark ? '#0c2a1f' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' },
    LECTURE_HALL: { bg: isDark ? '#0c1f3a' : '#dbeafe', text: isDark ? '#60a5fa' : '#1e40af' },
    MEETING_ROOM: { bg: isDark ? '#1e0c3a' : '#ede9fe', text: isDark ? '#a78bfa' : '#5b21b6' },
    EQUIPMENT:    { bg: isDark ? '#2a1c0a' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e' },
  }[resource.type] || { bg: '#1e2736', text: '#8899b4' };

  const sortedWindows = resource.availabilityWindows
    ? [...resource.availabilityWindows].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    )
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: c.modalBg,
        borderRadius: '16px',
        width: '520px',
        maxHeight: '88vh',
        overflowY: 'auto',
        border: `1px solid ${c.border}`,
      }}>

        {/* Banner */}
        <div style={{
          height: '120px',
          background: typeColor.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
        }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={typeColor.text} strokeWidth="1.5">
            <path d={cfg.iconPath} />
          </svg>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: c.textPrimary,
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              {resource.name}
            </h2>
            <span style={{
              background: typeColor.bg,
              color: typeColor.text,
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: '20px',
              flexShrink: 0,
              marginLeft: '12px',
              marginTop: '3px',
            }}>
              {cfg.label}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: c.textMuted, fontSize: '13px', marginBottom: '20px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {resource.location}
          </div>

          {/* Info grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}>
            {/* Status */}
            <div style={{
              background: isDark ? '#0d1117' : '#f8fafc',
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isActive ? c.success : c.danger,
                  display: 'inline-block',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: isActive ? c.success : c.danger }}>
                  {isActive ? 'Active' : 'Out of service'}
                </span>
              </div>
            </div>

            {/* Capacity */}
            <div style={{
              background: isDark ? '#0d1117' : '#f8fafc',
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Capacity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.textSecondary} strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary }}>
                  {resource.capacity ? `${resource.capacity} seats` : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Description
              </div>
              <p style={{ fontSize: '13px', color: c.textSecondary, lineHeight: 1.6, margin: 0 }}>
                {resource.description}
              </p>
            </div>
          )}

          {/* Availability schedule */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Availability schedule
            </div>

            {sortedWindows.length === 0 ? (
              <div style={{
                background: isDark ? '#0d1117' : '#f8fafc',
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: c.textMuted,
                fontSize: '13px',
              }}>
                No availability schedule set
              </div>
            ) : (
              <div style={{
                background: isDark ? '#0d1117' : '#f8fafc',
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {sortedWindows.map((w, i) => (
                  <div
                    key={w.day}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 16px',
                      borderBottom: i < sortedWindows.length - 1 ? `1px solid ${c.border}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: c.success,
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, width: '100px' }}>
                        {formatDay(w.day)}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '13px',
                      color: c.textSecondary,
                      fontFamily: 'monospace',
                      background: isDark ? '#1a2740' : '#e2e8f0',
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}>
                      {formatTime(w.openTime)} - {formatTime(w.closeTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                border: `1px solid ${c.border}`,
                background: 'transparent',
                color: c.textSecondary,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={() => { onClose(); onEdit(resource); }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  border: 'none',
                  background: '#1a56db',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Edit resource
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}