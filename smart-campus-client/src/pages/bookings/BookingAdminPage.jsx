export default function BookingAdminPage({
  isLoadingBookings,
  sortedBookings,
  statusFilter,
  requesterFilter,
  decisionInputs,
  onStatusFilterChange,
  onRequesterFilterChange,
  onDecisionInputChange,
  onApproveBooking,
  onRejectBooking,
  error,
  success,
}) {
  return (
    <>
      <div className="booking-content admin-layout">
        <article className="card reveal delay-1">
          <div className="table-head">
            <h2>All Bookings</h2>
            <div className="admin-filters">
              <label>
                Status
                <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
                  {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
                    <option key={status || 'ALL'} value={status}>
                      {status || 'ALL'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Requester ID
                <input value={requesterFilter} onChange={(event) => onRequesterFilterChange(event.target.value)} placeholder="student-001" />
              </label>
            </div>
          </div>

          {isLoadingBookings ? <p className="empty">Loading bookings...</p> : null}

          {!isLoadingBookings && sortedBookings.length === 0 ? (
            <p className="empty">No bookings found for selected admin filters.</p>
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
                  <p className="booking-meta">Requester: {booking.requesterId}</p>
                  <p className="booking-meta">Purpose: {booking.purpose}</p>
                  <p className="booking-meta">Attendees: {booking.expectedAttendees ?? 'N/A'}</p>
                  {booking.decisionReason ? <p className="booking-meta">Decision: {booking.decisionReason}</p> : null}
                  {booking.cancellationReason ? (
                    <p className="booking-meta">Cancellation: {booking.cancellationReason}</p>
                  ) : null}
                  {booking.reviewedByName ? <p className="booking-meta">Reviewed By: {booking.reviewedByName}</p> : null}
                  {booking.reviewedAt ? <p className="booking-meta">Reviewed At: {booking.reviewedAt}</p> : null}

                  {booking.status === 'PENDING' ? (
                    <div className="admin-actions">
                      <label>
                        Decision Reason
                        <input
                          value={decisionInputs[booking.id] || ''}
                          onChange={(event) => onDecisionInputChange(booking.id, event.target.value)}
                          placeholder="Optional for approve, required for reject"
                        />
                      </label>
                      <div className="admin-action-buttons">
                        <button type="button" className="approve-btn" onClick={() => onApproveBooking(booking.id)}>
                          Approve
                        </button>
                        <button type="button" className="reject-btn" onClick={() => onRejectBooking(booking.id)}>
                          Reject
                        </button>
                      </div>
                    </div>
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
