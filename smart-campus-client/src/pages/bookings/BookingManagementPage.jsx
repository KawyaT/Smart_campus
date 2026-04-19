import { useEffect, useMemo, useState } from 'react'
import { cancelBooking, createBooking, getMyBookings, getAvailableResources } from '../../api/bookingApi'
import './BookingManagementPage.css'

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const initialForm = {
  resourceId: '',
  resourceName: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
}

export default function BookingManagementPage() {
  const [user, setUser] = useState({ userId: 'student-001', userName: 'Default Student' })
  const [statusFilter, setStatusFilter] = useState('')
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadResources()
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, user.userId])

  async function loadResources() {
    setIsLoadingResources(true)
    try {
      const data = await getAvailableResources()
      setResources(data)
    } catch (resourceError) {
      console.warn('Failed to load resources:', resourceError.message)
      setResources([])
    } finally {
      setIsLoadingResources(false)
    }
  }

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const first = `${a.bookingDate}T${a.startTime}`
      const second = `${b.bookingDate}T${b.startTime}`
      return first < second ? 1 : -1
    })
  }, [bookings])

  async function loadBookings() {
    if (!user.userId.trim()) {
      setBookings([])
      return
    }

    setIsLoadingBookings(true)
    setError('')

    try {
      const data = await getMyBookings({ userId: user.userId.trim(), userName: user.userName.trim() }, statusFilter)
      setBookings(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  async function handleCreateBooking(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user.userId.trim()) {
      setError('User ID is required.')
      return
    }

    const attendees = form.expectedAttendees ? Number(form.expectedAttendees) : null
    const payload = {
      resourceId: form.resourceId.trim(),
      resourceName: form.resourceName.trim() || null,
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose.trim(),
      expectedAttendees: attendees,
    }

    setIsSubmitting(true)

    try {
      const created = await createBooking(payload, {
        userId: user.userId.trim(),
        userName: user.userName.trim(),
      })
      setSuccess(`Booking created as ${created.status}.`)
      setForm(initialForm)
      await loadBookings()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancelBooking(bookingId) {
    setError('')
    setSuccess('')

    try {
      await cancelBooking(bookingId, {
        userId: user.userId.trim(),
        userName: user.userName.trim(),
      })
      setSuccess('Booking cancelled successfully.')
      await loadBookings()
    } catch (cancelError) {
      setError(cancelError.message)
    }
  }

  function updateFormField(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <section className="booking-page">
      <header className="booking-header">
        <p className="kicker">Smart Campus</p>
        <h1>Booking Management</h1>
        <p className="subtitle">
          Request resources, check approval state, and cancel approved bookings from one place.
        </p>
      </header>

      <div className="identity-panel card reveal">
        <h2>Current User Context</h2>
        <p>These fields are used as request headers until full auth is connected.</p>
        <div className="identity-grid">
          <label>
            User ID
            <input
              name="userId"
              value={user.userId}
              onChange={(event) => setUser((prev) => ({ ...prev, userId: event.target.value }))}
              placeholder="student-001"
            />
          </label>
          <label>
            User Name (optional)
            <input
              name="userName"
              value={user.userName}
              onChange={(event) => setUser((prev) => ({ ...prev, userName: event.target.value }))}
              placeholder="Jane Doe"
            />
          </label>
        </div>
      </div>

      <div className="booking-content">
        <article className="card reveal delay-1">
          <h2>Request New Booking</h2>
          <form className="booking-form" onSubmit={handleCreateBooking}>
            <label>
              Select Resource
              <select
                name="resourceId"
                value={form.resourceId}
                onChange={(event) => {
                  const selectedId = event.target.value
                  const selectedResource = resources.find((r) => r.id === selectedId)
                  setForm((prev) => ({
                    ...prev,
                    resourceId: selectedId,
                    resourceName: selectedResource?.name || '',
                  }))
                }}
                required
              >
                <option value="">-- Choose a resource --</option>
                {isLoadingResources ? (
                  <option disabled>Loading resources...</option>
                ) : resources.length === 0 ? (
                  <option disabled>No resources available</option>
                ) : (
                  resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                      {resource.location ? ` (${resource.location})` : ''}
                      {resource.capacity ? ` - Capacity: ${resource.capacity}` : ''}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Date
              <input name="bookingDate" type="date" value={form.bookingDate} onChange={updateFormField} required />
            </label>

            <div className="time-grid">
              <label>
                Start Time
                <input name="startTime" type="time" value={form.startTime} onChange={updateFormField} required />
              </label>
              <label>
                End Time
                <input name="endTime" type="time" value={form.endTime} onChange={updateFormField} required />
              </label>
            </div>

            <label>
              Purpose
              <textarea name="purpose" value={form.purpose} onChange={updateFormField} rows={3} required />
            </label>

            <label>
              Expected Attendees (optional)
              <input
                name="expectedAttendees"
                type="number"
                min="1"
                value={form.expectedAttendees}
                onChange={updateFormField}
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </article>

        <article className="card reveal delay-2">
          <div className="table-head">
            <h2>My Bookings</h2>
            <label>
              Filter
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status || 'ALL'} value={status}>
                    {status || 'ALL'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoadingBookings ? <p className="empty">Loading bookings...</p> : null}

          {!isLoadingBookings && sortedBookings.length === 0 ? (
            <p className="empty">No bookings found for this user and filter.</p>
          ) : null}

          {!isLoadingBookings && sortedBookings.length > 0 ? (
            <div className="booking-list">
              {sortedBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-item-top">
                    <h3>{booking.resourceName || booking.resourceId}</h3>
                    <span className={`status-chip ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>

                  <p className="booking-meta">
                    {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="booking-meta">Purpose: {booking.purpose}</p>
                  <p className="booking-meta">Attendees: {booking.expectedAttendees ?? 'N/A'}</p>
                  {booking.decisionReason ? <p className="booking-meta">Decision: {booking.decisionReason}</p> : null}
                  {booking.cancellationReason ? (
                    <p className="booking-meta">Cancellation: {booking.cancellationReason}</p>
                  ) : null}

                  {booking.status === 'APPROVED' ? (
                    <button className="cancel-btn" onClick={() => handleCancelBooking(booking.id)}>
                      Cancel Booking
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </div>

      {error ? <p className="message error">{error}</p> : null}
      {success ? <p className="message success">{success}</p> : null}
    </section>
  )
}