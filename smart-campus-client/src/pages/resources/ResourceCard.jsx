import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

const typeConfig = {
  LAB:          { iconPath: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7', label: 'Lab', key: 'lab' },
  LECTURE_HALL: { iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', label: 'Lecture hall', key: 'hall' },
  MEETING_ROOM: { iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z', label: 'Meeting room', key: 'room' },
  EQUIPMENT:    { iconPath: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z', label: 'Equipment', key: 'equip' },
};

export default function ResourceCard({ resource, isAdmin, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const cfg = typeConfig[resource.type] || typeConfig.EQUIPMENT;
  const typeColor = c[cfg.key];
  const isActive = resource.status === 'ACTIVE';

  return (
    <div
      style={{
        background: c.cardBg,
        border: `1px solid ${c.border}`,
        borderRadius: '14px', overflow: 'hidden',
        transition: 'border-color .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = c.accent}
      onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
    >
      {/* Icon banner */}
      <div style={{
        height: '90px', background: typeColor.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={typeColor.text} strokeWidth="1.5">
          <path d={cfg.iconPath} />
        </svg>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            background: typeColor.bg, color: typeColor.text,
            fontSize: '10px', fontWeight: 500,
            padding: '3px 9px', borderRadius: '20px',
          }}>
            {cfg.label}
          </span>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: isActive ? c.success : c.danger,
            display: 'inline-block',
          }} />
        </div>

        <div style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary, marginBottom: '4px' }}>
          {resource.name}
        </div>

        <div style={{ fontSize: '12px', color: c.textMuted, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {resource.location}
        </div>

        <div style={{
          display: 'flex', gap: '14px', fontSize: '12px', color: c.textSecondary,
          padding: '10px 0', borderTop: `1px solid ${c.border}`,
          borderBottom: isAdmin ? `1px solid ${c.border}` : 'none',
          marginBottom: isAdmin ? '10px' : 0,
        }}>
          {resource.capacity && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              {resource.capacity} seats
            </span>
          )}
          <span style={{ color: isActive ? c.success : c.danger }}>
            {isActive ? 'Active' : 'Out of service'}
          </span>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onEdit(resource)} style={{
              flex: 1, padding: '7px', borderRadius: '7px', fontSize: '12px',
              cursor: 'pointer', background: c.hoverBg,
              border: `1px solid ${c.border}`, color: c.textSecondary,
            }}>
              Edit
            </button>
            <button onClick={() => onDelete(resource.id)} style={{
              padding: '7px 12px', borderRadius: '7px', fontSize: '12px',
              cursor: 'pointer', background: 'transparent',
              border: `1px solid ${isDark ? '#2d1515' : '#fecaca'}`,
              color: c.danger,
            }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}