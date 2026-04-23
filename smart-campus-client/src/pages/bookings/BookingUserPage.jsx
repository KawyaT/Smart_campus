import QRDisplay from '../../components/QRDisplay'

export default function BookingUserPage({
  resources,
  selectedResource,
  bookingWindowStart,
  bookingWindowEnd,
  isLoadingResources,
  form,
  isSubmitting,
  statusFilter,
  isLoadingBookings,
  sortedBookings,
  onFormChange,
  onResourceSelect,
  onSubmit,
  onStatusFilterChange,
  onCancelBooking,
  onStartEditBooking,
  onCancelEditBooking,
  isEditMode,
  error,
  success,
}) {
  const pendingCount = sortedBookings.filter((booking) => booking.status === 'PENDING').length
  const approvedCount = sortedBookings.filter((booking) => booking.status === 'APPROVED').length
  const rejectedCount = sortedBookings.filter((booking) => booking.status === 'REJECTED').length
  const cancelledCount = sortedBookings.filter((booking) => booking.status === 'CANCELLED').length

  return (
    <>
      <section className="booking-user-overview reveal delay-1" aria-label="Booking status summary">
        <article className="booking-overview-card total">
          <p>Total in view</p>
          <strong>{sortedBookings.length}</strong>
        </article>
        <article className="booking-overview-card pending">
          <p>Pending</p>
          <strong>{pendingCount}</strong>
        </article>
        <article className="booking-overview-card approved">
          <p>Approved</p>
          <strong>{approvedCount}</strong>
        </article>
        <article className="booking-overview-card rejected">
          <p>Rejected / Cancelled</p>
          <strong>{rejectedCount + cancelledCount}</strong>
        </article>
      </section>

      <div className="booking-content">
        <article className="card reveal delay-1">
          <h2>{isEditMode ? 'Update Pending Booking' : 'Request New Booking'}</h2>

          {selectedResource ? (
            <div className="resource-spotlight">
              <span className="resource-spotlight-kicker">Selected Resource</span>
              <strong>{selectedResource.name}</strong>
              <p>
                {selectedResource.location || 'Location unavailable'}
                {selectedResource.capacity ? ` | Capacity: ${selectedResource.capacity}` : ''}
              </p>
            </div>
          ) : null}

          <form className="booking-form" onSubmit={onSubmit}>
            <label className="booking-field booking-field--full">
              Select Resource
              <select
                name="resourceId"
                value={form.resourceId}
                onChange={onResourceSelect}
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

            <label className="booking-field booking-field--full">
              Date
              <input name="bookingDate" type="date" value={form.bookingDate} onChange={onFormChange} required />
            </label>

            <div className="time-grid booking-field booking-field--full">
              <label className="booking-field">
                Start Time
                <input
                  name="startTime"
                  type="time"
                  min={bookingWindowStart}
                  max={bookingWindowEnd}
                  value={form.startTime}
                  onChange={onFormChange}
                  required
                />
              </label>
              <label className="booking-field">
                End Time
                <input
                  name="endTime"
                  type="time"
                  min={bookingWindowStart}
                  max={bookingWindowEnd}
                  value={form.endTime}
                  onChange={onFormChange}
                  required
                />
              </label>
              <small className="field-hint">Allowed booking time: 08:30 AM to 05:00 PM</small>
            </div>

            <label className="booking-field booking-field--full">
              Purpose
              <textarea name="purpose" value={form.purpose} onChange={onFormChange} rows={3} required />
            </label>

            <label className="booking-field booking-field--full">
              Expected Attendees (optional)
              <input
                name="expectedAttendees"
                type="number"
                min="1"
                max={selectedResource?.capacity || undefined}
                value={form.expectedAttendees}
                onChange={onFormChange}
              />
              {selectedResource?.capacity ? (
                <small className="field-hint">Maximum for selected resource: {selectedResource.capacity}</small>
              ) : null}
            </label>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Submit Request'}
              </button>
              {isEditMode ? (
                <button type="button" className="secondary-btn" onClick={onCancelEditBooking}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card reveal delay-2">
          <div className="table-head">
            <h2>My Bookings</h2>
            <label>
              Filter
              <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
                {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
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
                <div key={booking.id} className={`booking-item booking-item-${booking.status.toLowerCase()}`}>
                  <div className="booking-item-top">
                    <h3>{booking.resourceName || booking.resourceId}</h3>
                    <span className={`status-chip ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>

                  <div className="booking-meta-grid">
                    <p className="booking-meta booking-meta-strong">
                      {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                    </p>
                    <p className="booking-meta">Purpose: {booking.purpose}</p>
                    <p className="booking-meta">Attendees: {booking.expectedAttendees ?? 'N/A'}</p>
                  </div>

                  {booking.decisionReason ? <p className="booking-meta">Decision: {booking.decisionReason}</p> : null}
                  {booking.cancellationReason ? (
                    <p className="booking-meta">Cancellation: {booking.cancellationReason}</p>
                  ) : null}

                  {booking.status === 'APPROVED' ? (
                    <>
                      <QRDisplay booking={booking} />
                      <button className="cancel-btn" type="button" onClick={() => onCancelBooking(booking.id)}>
                        Cancel Booking
                      </button>
                    </>
                  ) : null}

                  {booking.status === 'PENDING' ? (
                    <button className="secondary-btn" type="button" onClick={() => onStartEditBooking(booking)}>
                      Edit Booking
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
    </>
  )
}
