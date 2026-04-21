import React, { useState, useEffect } from 'react';
import { validateResourceForm } from '../../utils/resourceValidation';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export default function ResourceFormModal({ resource, onSave, onClose }) {
  const { isDark } = useTheme();
  const c = getColors(isDark);

  const inputBase = {
    width: '100%', padding: '8px 12px',
    background: c.inputBg,
    borderRadius: '8px', fontSize: '13px',
    color: c.textPrimary, outline: 'none', marginBottom: '4px',
  };

  const labelStyle = {
    fontSize: '12px', color: c.textMuted,
    display: 'block', marginBottom: '4px',
  };

  const errorStyle = {
    fontSize: '11px', color: c.danger,
    marginBottom: '10px', display: 'block',
  };

  const [form, setForm] = useState({
    name: '', type: 'LAB', capacity: '', location: '',
    description: '', status: 'ACTIVE', availabilityWindows: [],
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (resource) setForm({ ...resource, capacity: resource.capacity || '' });
  }, [resource]);

  const set = (key, val) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    if (submitted) {
      setErrors(validateResourceForm(updated));
    }
  };

  const toggleDay = (day) => {
    const exists = form.availabilityWindows.find(w => w.day === day);
    set('availabilityWindows', exists
      ? form.availabilityWindows.filter(w => w.day !== day)
      : [...form.availabilityWindows, { day, openTime: '08:00:00', closeTime: '18:00:00' }]
    );
  };

  const updateWindow = (day, field, value) => {
    set('availabilityWindows', form.availabilityWindows.map(w =>
      w.day === day ? { ...w, [field]: value } : w
    ));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const newErrors = validateResourceForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSave({ ...form, capacity: form.capacity ? Number(form.capacity) : null });
  };

  const getInputStyle = (field) => ({
    ...inputBase,
    border: errors[field] ? `1px solid ${c.danger}` : `1px solid ${c.border}`,
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: c.modalBg, borderRadius: '16px',
        padding: '24px', width: '480px', maxHeight: '88vh',
        overflowY: 'auto', border: `1px solid ${c.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: c.textPrimary }}>
            {resource ? 'Edit resource' : 'Add new resource'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: c.textMuted,
            fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <label style={labelStyle}>
          Name <span style={{ color: c.danger }}>*</span>
        </label>
        <input
          style={getInputStyle('name')}
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Computer Lab A101"
          maxLength={100}
        />
        {errors.name && <span style={errorStyle}>{errors.name}</span>}
        <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px', textAlign: 'right' }}>
          {form.name.length}/100
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              Type <span style={{ color: c.danger }}>*</span>
            </label>
            <select
              style={{ ...getInputStyle('type'), marginBottom: errors.type ? '4px' : '12px' }}
              value={form.type}
              onChange={e => set('type', e.target.value)}
            >
              <option value="LAB">Lab</option>
              <option value="LECTURE_HALL">Lecture hall</option>
              <option value="MEETING_ROOM">Meeting room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
            {errors.type && <span style={errorStyle}>{errors.type}</span>}
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...getInputStyle('status'), marginBottom: '12px' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
          </div>
        </div>

        <label style={labelStyle}>
          Location <span style={{ color: c.danger }}>*</span>
        </label>
        <input
          style={getInputStyle('location')}
          value={form.location}
          onChange={e => set('location', e.target.value)}
          placeholder="e.g. Block A, Floor 1"
          maxLength={150}
        />
        {errors.location && <span style={errorStyle}>{errors.location}</span>}
        <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px', textAlign: 'right' }}>
          {form.location.length}/150
        </div>

        <label style={labelStyle}>Capacity</label>
        <input
          style={getInputStyle('capacity')}
          type="number"
          value={form.capacity}
          onChange={e => set('capacity', e.target.value)}
          placeholder="e.g. 30"
          min={1}
          max={5000}
        />
        {errors.capacity
          ? <span style={errorStyle}>{errors.capacity}</span>
          : <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px' }}>Between 1 and 5000</div>
        }

        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...getInputStyle('description'), height: '72px', resize: 'vertical' }}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Optional description..."
          maxLength={500}
        />
        {errors.description && <span style={errorStyle}>{errors.description}</span>}
        <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px', textAlign: 'right' }}>
          {(form.description || '').length}/500
        </div>

        <label style={{ ...labelStyle, marginBottom: '8px' }}>Available days</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {DAYS.map(day => {
            const active = form.availabilityWindows.some(w => w.day === day);
            return (
              <button key={day} onClick={() => toggleDay(day)} style={{
                fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                cursor: 'pointer', border: '1px solid ' + (active ? c.accent : c.border),
                background: active ? (isDark ? '#0c1f3a' : '#dbeafe') : 'transparent',
                color: active ? (isDark ? '#60a5fa' : '#2563eb') : c.textSecondary,
              }}>
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>

        {form.availabilityWindows.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {form.availabilityWindows.map((w, i) => (
              <div key={w.day} style={{
                background: c.inputBg, border: `1px solid ${c.border}`,
                borderRadius: '8px', padding: '10px 12px', marginBottom: '8px',
              }}>
                <div style={{ fontSize: '12px', color: isDark ? '#60a5fa' : '#2563eb', marginBottom: '8px', fontWeight: 500 }}>
                  {w.day.charAt(0) + w.day.slice(1).toLowerCase()}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, marginBottom: '2px' }}>Open</label>
                    <input
                      type="time"
                      style={{ ...inputBase, border: `1px solid ${c.border}`, marginBottom: 0 }}
                      value={w.openTime?.slice(0, 5) || '08:00'}
                      onChange={e => updateWindow(w.day, 'openTime', e.target.value + ':00')}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, marginBottom: '2px' }}>Close</label>
                    <input
                      type="time"
                      style={{ ...inputBase, border: `1px solid ${c.border}`, marginBottom: 0 }}
                      value={w.closeTime?.slice(0, 5) || '18:00'}
                      onChange={e => updateWindow(w.day, 'closeTime', e.target.value + ':00')}
                    />
                  </div>
                </div>
                {errors[`window_${i}`] && (
                  <span style={{ ...errorStyle, marginTop: '6px', marginBottom: 0 }}>
                    {errors[`window_${i}`]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {submitted && Object.keys(errors).length > 0 && (
          <div style={{
            background: isDark ? '#2d1515' : '#fee2e2', border: `1px solid ${c.danger}`,
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: c.danger, fontWeight: 500, marginBottom: '4px' }}>
              Please fix the following:
            </p>
            {Object.values(errors).map((e, i) => (
              <p key={i} style={{ fontSize: '12px', color: c.danger, margin: '2px 0' }}>• {e}</p>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
            border: `1px solid ${c.border}`, background: 'transparent',
            color: c.textSecondary, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
            border: 'none', background: c.accent,
            color: '#fff', cursor: 'pointer', fontWeight: 500,
          }}>
            {resource ? 'Save changes' : 'Add resource'}
          </button>
        </div>
      </div>
    </div>
  );
}