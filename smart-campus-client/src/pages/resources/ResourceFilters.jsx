import React, { useState } from 'react';
import { validateSearchFilters } from '../../utils/resourceValidation';

const inputBase = {
  background: '#111827',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#fff',
  outline: 'none',
};

export default function ResourceFilters({ filters, onChange }) {
  const [errors, setErrors] = useState({});

  const handle = (key, val) => {
    const updated = { ...filters, [key]: val };
    const newErrors = validateSearchFilters(updated);
    setErrors(newErrors);
    if (!newErrors[key]) onChange(updated);
  };

  const getStyle = (field) => ({
    ...inputBase,
    border: errors[field] ? '1px solid #f87171' : '1px solid #1e2736',
  });

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#4b6a9b' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          style={{ ...getStyle('search'), width: '100%', paddingLeft: '34px' }}
          placeholder="Search by name or location..."
          value={filters.search || ''}
          onChange={e => handle('search', e.target.value)}
          maxLength={100}
        />
      </div>

      <select style={getStyle('type')} value={filters.type || ''} onChange={e => handle('type', e.target.value)}>
        <option value="">All types</option>
        <option value="LAB">Lab</option>
        <option value="LECTURE_HALL">Lecture hall</option>
        <option value="MEETING_ROOM">Meeting room</option>
        <option value="EQUIPMENT">Equipment</option>
      </select>

      <select style={getStyle('status')} value={filters.status || ''} onChange={e => handle('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="OUT_OF_SERVICE">Out of service</option>
      </select>

        <input
          style={{ ...getStyle('minCapacity'), width: '130px' }}
          type="number"
          placeholder="Min capacity"
          value={filters.minCapacity || ''}
          onChange={e => handle('minCapacity', e.target.value)}
          min={1}
          max={5000}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
        {errors.search && (
          <span style={{ fontSize: '11px', color: '#f87171' }}>{errors.search}</span>
        )}
        {errors.minCapacity && (
          <span style={{ fontSize: '11px', color: '#f87171', marginLeft: 'auto' }}>
            Capacity: {errors.minCapacity}
          </span>
        )}
      </div>
    </div>
  );
}