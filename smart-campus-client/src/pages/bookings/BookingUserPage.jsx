export default function BookingUserPage({
  resources,
  selectedResource,
  isLoadingResources,
  form,
  isSubmitting,
  statusFilter,
  isLoadingBookings,
  sortedBookings,
  user,
  onUserChange,
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
  return (
    <>
      <div className="identity-panel card reveal">
        <h2>Current User Context</h2>
        <p>These fields are used as request headers until full auth is connected.</p>
        <div className="identity-grid">
          <label>
            User ID
            <input
              name="userId"
              value={user.userId}
              onChange={(event) => onUserChange('userId', event.target.value)}
              placeholder="student-001"
            />
          </label>
          <label>
            User Name (optional)
            <input
              name="userName"
              value={user.userName}
              onChange={(event) => onUserChange('userName', event.target.value)}
              placeholder="Jane Doe"
            />
          </label>
        </div>
      </div>

      <div className="booking-content">
        <article className="card reveal delay-1">
          <h2>{isEditMode ? 'Update Pending Booking' : 'Request New Booking'}</h2>
          <form className="booking-form" onSubmit={onSubmit}>
            <label>
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

            <label>
              Date
              <input name="bookingDate" type="date" value={form.bookingDate} onChange={onFormChange} required />
            </label>

            <div className="time-grid">
              <label>
                Start Time
                <input name="startTime" type="time" value={form.startTime} onChange={onFormChange} required />
              </label>
              <label>
                End Time
                <input name="endTime" type="time" value={form.endTime} onChange={onFormChange} required />
              </label>
            </div>

            <label>
              Purpose
              <textarea name="purpose" value={form.purpose} onChange={onFormChange} rows={3} required />
            </label>

            <label>
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
                    <button className="cancel-btn" type="button" onClick={() => onCancelBooking(booking.id)}>
                      Cancel Booking
                    </button>
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
