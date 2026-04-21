export const getColors = (isDark) => ({
  // backgrounds
  pageBg:       isDark ? '#0d1117' : '#f0f4f8',
  cardBg:       isDark ? '#111827' : '#ffffff',
  sidebarBg:    isDark ? '#0d1117' : '#ffffff',
  inputBg:      isDark ? '#0d1117' : '#f8fafc',
  modalBg:      isDark ? '#111827' : '#ffffff',
  statBg:       isDark ? '#111827' : '#ffffff',
  hoverBg:      isDark ? '#1a2740' : '#f0f4f8',

  // borders
  border:       isDark ? '#1e2736' : '#e2e8f0',
  borderHover:  isDark ? '#1a56db' : '#3b82f6',

  // text
  textPrimary:  isDark ? '#ffffff' : '#0f172a',
  textSecondary:isDark ? '#8899b4' : '#64748b',
  textMuted:    isDark ? '#4b6a9b' : '#94a3b8',

  // accent
  accent:       '#1a56db',
  accentHover:  '#1d4ed8',

  // status
  success:      isDark ? '#34d399' : '#059669',
  danger:       isDark ? '#f87171' : '#dc2626',
  warning:      isDark ? '#fbbf24' : '#d97706',

  // type badge colors
  lab:     { bg: isDark ? '#0c2a1f' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' },
  hall:    { bg: isDark ? '#0c1f3a' : '#dbeafe', text: isDark ? '#60a5fa' : '#1e40af' },
  room:    { bg: isDark ? '#1e0c3a' : '#ede9fe', text: isDark ? '#a78bfa' : '#5b21b6' },
  equip:   { bg: isDark ? '#2a1c0a' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e' },
});