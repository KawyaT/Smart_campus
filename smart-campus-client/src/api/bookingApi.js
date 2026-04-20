const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const raw = await response.text()
  const data = raw ? JSON.parse(raw) : null

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed'
    throw new Error(message)
  }

  return data
}

function userHeaders(user) {
  return {
    'X-User-Id': user.userId,
    'X-User-Name': user.userName || '',
  }
}

export function createBooking(payload, user) {
  return request('/api/bookings', {
    method: 'POST',
    headers: userHeaders(user),
    body: payload,
  })
}

export function getMyBookings(user, status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/api/bookings/my${query}`, {
    headers: userHeaders(user),
  })
}

export function cancelBooking(bookingId, user) {
  return request(`/api/bookings/my/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: userHeaders(user),
  })
}

export function updateMyBooking(bookingId, payload, user) {
  return request(`/api/bookings/my/${bookingId}`, {
    method: 'PATCH',
    headers: userHeaders(user),
    body: payload,
  })
}

export function getAllBookingsForAdmin(status, requesterId) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (requesterId) params.set('requesterId', requesterId)
  const query = params.toString()

  return request(`/api/bookings/admin${query ? `?${query}` : ''}`)
}

export function approveBooking(bookingId, user, reason) {
  return request(`/api/bookings/admin/${bookingId}/approve`, {
    method: 'PATCH',
    headers: userHeaders(user),
    body: { reason: reason || null },
  })
}

export function rejectBooking(bookingId, user, reason) {
  return request(`/api/bookings/admin/${bookingId}/reject`, {
    method: 'PATCH',
    headers: userHeaders(user),
    body: { reason },
  })
}

export function getAvailableResources() {
  return request('/api/resources')
}