import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

const formatHour = (hour) => {
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
};

const timeToDecimal = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

const isCellAvailable = (windows, day, hour) => {
  const window = windows.find((entry) => entry.day === day);
  if (!window) return false;

  const open = timeToDecimal(window.openTime);
  const close = timeToDecimal(window.closeTime);
  return hour >= open && hour < close;
};

export default function AvailabilityHeatmap({ availabilityWindows }) {
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const [hoveredCell, setHoveredCell] = useState(null);

  const windows = availabilityWindows || [];

  const availableDays = DAYS.filter((day) => windows.some((window) => window.day === day));

  const totalAvailableHours = DAYS.reduce((total, day) => {
    const window = windows.find((entry) => entry.day === day);
    if (!window) return total;
    return total + (timeToDecimal(window.closeTime) - timeToDecimal(window.openTime));
  }, 0);

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '16px',
      }}>
        <div style={{
          background: isDark ? '#0d1117' : '#f8fafc',
          border: `1px solid ${c.border}`,
          borderRadius: '10px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: c.success }}>
            {availableDays.length}
          </div>
          <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '2px' }}>
            Days available
          </div>
        </div>
        <div style={{
          background: isDark ? '#0d1117' : '#f8fafc',
          border: `1px solid ${c.border}`,
          borderRadius: '10px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#60a5fa' : '#2563eb' }}>
            {Math.round(totalAvailableHours)}h
          </div>
          <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '2px' }}>
            Hours per week
          </div>
        </div>
        <div style={{
          background: isDark ? '#0d1117' : '#f8fafc',
          border: `1px solid ${c.border}`,
          borderRadius: '10px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#fbbf24' : '#d97706' }}>
            {availableDays.length > 0 ? `${Math.round(totalAvailableHours / availableDays.length)}h` : '0h'}
          </div>
          <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '2px' }}>
            Avg per day
          </div>
        </div>
      </div>

      {windows.length === 0 ? (
        <div style={{
          background: isDark ? '#0d1117' : '#f8fafc',
          border: `1px solid ${c.border}`,
          borderRadius: '10px',
          padding: '24px',
          textAlign: 'center',
          color: c.textMuted,
          fontSize: '13px',
        }}>
          No availability schedule set for this resource
        </div>
      ) : (
        <div style={{
          background: isDark ? '#0d1117' : '#f8fafc',
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          padding: '16px',
          overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', gap: '4px', minWidth: '420px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '28px' }}>
              {HOURS.map((hour) => (
                <div key={hour} style={{
                  height: '22px',
                  width: '32px',
                  fontSize: '10px',
                  color: c.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '6px',
                  flexShrink: 0,
                }}>
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {DAYS.map((day, index) => {
              const hasSchedule = windows.some((window) => window.day === day);

              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                  <div style={{
                    height: '24px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: hasSchedule ? c.textPrimary : c.textMuted,
                    textAlign: 'center',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {DAY_SHORT[index]}
                  </div>

                  {HOURS.map((hour) => {
                    const available = isCellAvailable(windows, day, hour);
                    const isHovered = hoveredCell && hoveredCell.day === day && hoveredCell.hour === hour;

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHoveredCell({ day, hour, available })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          height: '22px',
                          borderRadius: '4px',
                          background: available
                            ? isHovered
                              ? isDark ? '#22c55e' : '#16a34a'
                              : isDark ? '#166534' : '#bbf7d0'
                            : isHovered
                              ? isDark ? '#1e2736' : '#e2e8f0'
                              : isDark ? '#111827' : '#f1f5f9',
                          border: `1px solid ${available
                            ? isDark ? '#166534' : '#86efac'
                            : isDark ? '#1e2736' : '#e2e8f0'}`,
                          cursor: 'pointer',
                          transition: 'background .1s',
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {hoveredCell && (
            <div style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: isDark ? '#1a2740' : '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              color: c.textPrimary,
              textAlign: 'center',
            }}>
              <span style={{ fontWeight: 500 }}>
                {hoveredCell.day.charAt(0) + hoveredCell.day.slice(1).toLowerCase()}
              </span>
              {' '}
              {formatHour(hoveredCell.hour)} — {formatHour(hoveredCell.hour + 1)}
              {' · '}
              <span style={{ color: hoveredCell.available ? c.success : c.danger, fontWeight: 500 }}>
                {hoveredCell.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '14px',
            justifyContent: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: c.textMuted }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: isDark ? '#166534' : '#bbf7d0',
                border: `1px solid ${isDark ? '#166534' : '#86efac'}`,
              }} />
              Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: c.textMuted }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: isDark ? '#111827' : '#f1f5f9',
                border: `1px solid ${isDark ? '#1e2736' : '#e2e8f0'}`,
              }} />
              Unavailable
            </div>
          </div>
        </div>
      )}
    </div>
  );
}