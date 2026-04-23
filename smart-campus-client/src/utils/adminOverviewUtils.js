/** Utilities for admin dashboard overview stats and priority queue (no React). */

const PRIORITY_RANK = {
  CRITICAL: 400,
  HIGH: 300,
  MEDIUM: 200,
  LOW: 100,
};

function truncate(text, max) {
  if (!text || typeof text !== 'string') return '';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function parseBookingStartMs(booking) {
  if (!booking?.bookingDate) return Date.now();
  const time = booking.startTime && String(booking.startTime).trim() ? booking.startTime : '09:00';
  const iso = `${booking.bookingDate}T${time}`;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? Date.now() : ms;
}

export function formatWhen(isoLike) {
  if (!isoLike) return '—';
  try {
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function formatBookingQueueWhen(booking) {
  const datePart = booking?.bookingDate || '';
  const start = booking?.startTime || '';
  const end = booking?.endTime || '';
  if (!datePart) return '—';
  const span = start && end ? `${start}–${end}` : start || '';
  return span ? `${datePart} · ${span}` : datePart;
}

/** Higher score = earlier in priority queue. */
export function urgencyScoreIncident(ticket) {
  const base = PRIORITY_RANK[ticket.priority] ?? 150;
  const created = ticket.createdAt ? new Date(ticket.createdAt).getTime() : Date.now();
  const ageHours = Math.max(0, (Date.now() - created) / 3600000);
  return base * 1e9 + Math.min(ageHours, 8760) * 1e6;
}

/** Pending booking: overdue or soon starts = more urgent. */
export function urgencyScoreBooking(booking) {
  const startMs = parseBookingStartMs(booking);
  const hoursUntil = (startMs - Date.now()) / 3600000;
  if (hoursUntil < 0) {
    return 380 * 1e9 + Math.min(-hoursUntil, 8760) * 1e8;
  }
  return 320 * 1e9 + Math.max(0, 336 - hoursUntil) * 1e7;
}

/**
 * Build merged priority queue rows from pending bookings and open/in-progress tickets.
 * @returns {Array<{ key: string, navTarget: string, typeLabel: string, summary: string, subtitle: string, whenLabel: string, statusLabel: string, badge: string }>}
 */
export function buildPriorityQueue(pendingBookings, allTickets, { maxRows = 12 } = {}) {
  const tickets = Array.isArray(allTickets) ? allTickets : [];
  const bookings = Array.isArray(pendingBookings) ? pendingBookings : [];

  const openIncidents = tickets.filter(
    (t) => t && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  );

  const incidentRows = openIncidents.map((t) => {
    const titleStr = (t.title && String(t.title).trim()) || 'Untitled incident';
    const cat = t.category ? String(t.category).replace(/_/g, ' ') : '';
    let subtitle = cat;
    if (!subtitle && t.priority) {
      const pri = String(t.priority).replace(/_/g, ' ');
      if (!titleStr.toUpperCase().includes(pri.toUpperCase())) subtitle = pri;
    }
    return {
    key: `incident-${t.id}`,
    navTarget: 'incidents',
    typeLabel: 'Incident',
    summary: titleStr,
    subtitle: subtitle || '',
    whenLabel: formatWhen(t.createdAt || t.updatedAt),
    statusLabel: t.status === 'IN_PROGRESS' ? 'In progress' : 'Open',
    badge: t.priority ? String(t.priority) : '',
    _score: urgencyScoreIncident(t),
  };
  });

  const bookingRows = bookings.map((b) => ({
    key: `booking-${b.id}`,
    navTarget: 'bookings',
    typeLabel: 'Booking approval',
    summary: `${b.resourceName || b.resourceId || 'Resource'} · ${b.bookingDate || '—'}`,
    subtitle: truncate(b.purpose || '', 100) || formatBookingQueueWhen(b),
    whenLabel: formatBookingQueueWhen(b),
    statusLabel: 'Pending approval',
    badge: '',
    _score: urgencyScoreBooking(b),
  }));

  const merged = [...incidentRows, ...bookingRows]
    .sort((a, b) => b._score - a._score)
    .slice(0, maxRows)
    .map(({ _score, ...row }) => row);

  return merged;
}
