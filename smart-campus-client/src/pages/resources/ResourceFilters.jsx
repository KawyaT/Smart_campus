import React from 'react';

const inputStyle = {
  background: '#111827',
  border: '1px solid #1e2736',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#fff',
  outline: 'none',
};

export default function ResourceFilters({ filters, onChange }) {
  const handle = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#4b6a9b' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          style={{ ...inputStyle, width: '100%', paddingLeft: '34px' }}
          placeholder="Search by name or location..."
          value={filters.search || ''}
          onChange={e => handle('search', e.target.value)}
        />
      </div>

      <select style={inputStyle} value={filters.type || ''} onChange={e => handle('type', e.target.value)}>
        <option value="">All types</option>
        <option value="LAB">Lab</option>
        <option value="LECTURE_HALL">Lecture hall</option>
        <option value="MEETING_ROOM">Meeting room</option>
        <option value="EQUIPMENT">Equipment</option>
      </select>

      <select style={inputStyle} value={filters.status || ''} onChange={e => handle('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="OUT_OF_SERVICE">Out of service</option>
      </select>

      <input
        style={{ ...inputStyle, width: '130px' }}
        type="number"
        placeholder="Min capacity"
        value={filters.minCapacity || ''}
        onChange={e => handle('minCapacity', e.target.value)}
      />
    </div>
  );
}