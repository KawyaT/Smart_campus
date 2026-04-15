import React, { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%', padding: '8px 12px',
  background: '#0d1117',
  border: '1px solid #1e2736',
  borderRadius: '8px', fontSize: '13px',
  color: '#fff', outline: 'none', marginBottom: '12px',
};

const labelStyle = { fontSize: '12px', color: '#4b6a9b', display: 'block', marginBottom: '4px' };

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export default function ResourceFormModal({ resource, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', type: 'LAB', capacity: '', location: '',
    description: '', status: 'ACTIVE', availabilityWindows: [],
  });

  useEffect(() => {
    if (resource) setForm({ ...resource, capacity: resource.capacity || '' });
  }, [resource]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleDay = (day) => {
    const exists = form.availabilityWindows.find(w => w.day === day);
    set('availabilityWindows', exists
      ? form.availabilityWindows.filter(w => w.day !== day)
      : [...form.availabilityWindows, { day, openTime: '08:00:00', closeTime: '18:00:00' }]
    );
  };

  const handleSubmit = () => {
    if (!form.name || !form.location) return alert('Name and location are required');
    onSave({ ...form, capacity: form.capacity ? Number(form.capacity) : null });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#111827', borderRadius: '16px',
        padding: '24px', width: '460px', maxHeight: '85vh',
        overflowY: 'auto', border: '1px solid #1e2736',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#fff' }}>
            {resource ? 'Edit resource' : 'Add new resource'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#4b6a9b',
            fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <label style={labelStyle}>Name *</label>
        <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Computer Lab A101" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Type *</label>
            <select style={{ ...inputStyle, marginBottom: 0 }} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="LAB">Lab</option>
              <option value="LECTURE_HALL">Lecture hall</option>
              <option value="MEETING_ROOM">Meeting room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, marginBottom: 0 }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={labelStyle}>Location *</label>
          <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, Floor 1" />
        </div>

        <label style={labelStyle}>Capacity</label>
        <input style={inputStyle} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 30" />

        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, height: '70px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description..." />

        <label style={{ ...labelStyle, marginBottom: '8px' }}>Available days</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {DAYS.map(day => {
            const active = form.availabilityWindows.some(w => w.day === day);
            return (
              <button key={day} onClick={() => toggleDay(day)} style={{
                fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                cursor: 'pointer', border: '1px solid ' + (active ? '#1a56db' : '#1e2736'),
                background: active ? '#0c1f3a' : 'transparent',
                color: active ? '#60a5fa' : '#8899b4',
              }}>
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid #1e2736', background: 'transparent',
            color: '#8899b4', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
            border: 'none', background: '#1a56db',
            color: '#fff', cursor: 'pointer', fontWeight: 500,
          }}>
            {resource ? 'Save changes' : 'Add resource'}
          </button>
        </div>
      </div>
    </div>
  );
}