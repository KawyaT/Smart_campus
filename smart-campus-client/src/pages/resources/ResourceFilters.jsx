import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';
import { validateSearchFilters } from '../../utils/resourceValidation';

export default function ResourceFilters({ filters, onChange }) {
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const [errors, setErrors] = useState({});

  const inputBase = {
    background: c.inputBg,
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    color: c.textPrimary,
    outline: 'none',
    height: '40px',
  };

  const handle = (key, val) => {
    const updated = { ...filters, [key]: val };
    const newErrors = validateSearchFilters(updated);
    setErrors(newErrors);
    if (!newErrors[key]) onChange(updated);
  };

  const getStyle = (field) => ({
    ...inputBase,
    border: errors[field]
      ? '1px solid ' + c.danger
      : '1px solid ' + c.border,
  });

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>

        <div style={{ position: 'relative', flex: '1 1 290px', minWidth: '200px' }}>
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '15px',
              height: '15px',
              color: c.textMuted,
              pointerEvents: 'none',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={{ ...getStyle('search'), width: '100%', paddingLeft: '36px' }}
            placeholder="Search by name or location..."
            value={filters.search || ''}
            onChange={e => handle('search', e.target.value)}
            maxLength={100}
          />
        </div>

        <select
          style={{ ...getStyle('type'), width: '150px', flexShrink: 0, cursor: 'pointer' }}
          value={filters.type || ''}
          onChange={e => handle('type', e.target.value)}
        >
          <option value="">All types</option>
          <option value="LAB">Lab</option>
          <option value="LECTURE_HALL">Lecture hall</option>
          <option value="MEETING_ROOM">Meeting room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <select
          style={{ ...getStyle('status'), width: '160px', flexShrink: 0, cursor: 'pointer' }}
          value={filters.status || ''}
          onChange={e => handle('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of service</option>
        </select>

        <input
          style={{ ...getStyle('minCapacity'), width: '130px', flexShrink: 0 }}
          type="number"
          placeholder="Min capacity"
          value={filters.minCapacity || ''}
          onChange={e => handle('minCapacity', e.target.value)}
          min="1"
          max="5000"
        />

      </div>

      {(errors.search || errors.minCapacity) && (
        <div style={{ marginTop: '6px', display: 'flex', gap: '12px' }}>
          {errors.search && (
            <span style={{ fontSize: '11px', color: c.danger }}>
              {errors.search}
            </span>
          )}
          {errors.minCapacity && (
            <span style={{ fontSize: '11px', color: c.danger }}>
              Capacity: {errors.minCapacity}
            </span>
          )}
        </div>
      )}

    </div>
  );
}