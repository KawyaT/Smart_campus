import { jsPDF } from 'jspdf'
import QRScanner from '../../components/QRScanner'

export default function BookingAdminPage({
  isLoadingBookings,
  sortedBookings,
  analytics,
  isLoadingAnalytics,
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
  const formatFilter = (value) => (value ? value : 'All')
  const formatBookingDateTime = (booking) => {
    const datePart = booking.bookingDate || 'Unknown date'
    const timePart = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : 'Unknown time'
    return `${datePart} | ${timePart}`
  }

  const wrapText = (doc, text, maxWidth) => doc.splitTextToSize(String(text ?? ''), maxWidth)

  const addPageHeader = (doc, title, subtitle) => {
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 20, 'F')

    doc.setFillColor(241, 245, 249)
    doc.rect(0, 20, 210, 8, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(title, 14, 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    doc.text(subtitle, 14, 25)

    doc.setTextColor(15, 23, 42)
  }

  const addSectionTitle = (doc, title, y) => {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(14, y - 5.8, 182, 8, 2, 2, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(14, y - 5.8, 182, 8, 2, 2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text(title, 18, y)
    doc.setTextColor(15, 23, 42)
  }

  const addPageFooter = (doc, generatedAt) => {
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageNumber = doc.getCurrentPageInfo().pageNumber
    doc.setDrawColor(226, 232, 240)
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated: ${generatedAt}`, 14, pageHeight - 7)
    doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 7, { align: 'right' })
    doc.setTextColor(15, 23, 42)
  }

  const addWrappedLines = (doc, lines, x, startY, generatedAt, lineHeight = 6, pageBottom = 280) => {
    let y = startY
    lines.forEach((line) => {
      if (y > pageBottom) {
        addPageFooter(doc, generatedAt)
        doc.addPage()
        addPageHeader(doc, 'Booking Report', 'Smart Campus booking summary')
        y = 36
      }
      doc.text(line, x, y)
      y += lineHeight
    })
    return y
  }

  const downloadReport = () => {
    const doc = new jsPDF()
    const generatedAt = new Date().toLocaleString()
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - 28

    addPageHeader(doc, 'Booking Report', `Generated ${generatedAt}`)

    let y = 40
    addSectionTitle(doc, 'Summary', y)
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const summaryLines = [
      `Current filters: Status ${formatFilter(statusFilter)}, Requester ${formatFilter(requesterFilter)}`,
      `Total tracked bookings: ${analytics.totalTrackedBookings || 0}`,
      `Pending: ${pendingCount} | Approved: ${approvedCount} | Rejected / Cancelled: ${rejectedCount + cancelledCount}`,
      `Top resource: ${topResource?.label || 'N/A'} (${topResource?.count || 0})`,
      `Peak booking hour: ${peakHour?.label || 'N/A'} (${peakHour?.count || 0})`,
    ]
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(14, y - 4, 182, 35, 2, 2, 'FD')
    y = addWrappedLines(doc, summaryLines, 18, y + 2, generatedAt, 6, 272)

    y += 5
    addSectionTitle(doc, 'Bookings', y)
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    if (sortedBookings.length === 0) {
      doc.text('No bookings match the current filters.', 14, y)
    } else {
      sortedBookings.forEach((booking, index) => {
        const blockHeight = 30
        if (y + blockHeight > 280) {
          addPageFooter(doc, generatedAt)
          doc.addPage()
          addPageHeader(doc, 'Booking Report', `Generated ${generatedAt}`)
          y = 36
        }

        doc.setDrawColor(226, 232, 240)
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(14, y - 4, 182, blockHeight, 3, 3, 'FD')

        doc.setFillColor(241, 245, 249)
        doc.roundedRect(16, y - 2.5, 16, 5.5, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.setFontSize(8)
        doc.text((booking.status || 'N/A').slice(0, 12), 24, y + 1, { align: 'center' })

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(10)
        doc.text(`${index + 1}. ${booking.resourceName || booking.resourceId || 'Unknown resource'}`, 35, y + 1)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const statusLine = `Status: ${booking.status}`
        const dateLine = `Schedule: ${formatBookingDateTime(booking)}`
        const requesterLine = `Requester: ${booking.requesterId || 'N/A'}`
        const purposeLine = `Purpose: ${booking.purpose || 'N/A'}`
        const attendeesLine = `Attendees: ${booking.expectedAttendees ?? 'N/A'}`

        const details = [statusLine, dateLine, requesterLine, purposeLine, attendeesLine]
        let detailY = y + 7
        details.forEach((line) => {
          const wrapped = wrapText(doc, line, contentWidth - 8)
          wrapped.forEach((segment) => {
            if (detailY > 280) {
              addPageFooter(doc, generatedAt)
              doc.addPage()
              addPageHeader(doc, 'Booking Report', `Generated ${generatedAt}`)
              detailY = 36
            }
            doc.text(segment, 18, detailY)
            detailY += 5
          })
        })

        y += blockHeight + 6
      })
    }

    addPageFooter(doc, generatedAt)

    doc.save(`booking-report-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const resourceMax = Math.max(...analytics.topResources.map((item) => item.count), 1)
  const hourMax = Math.max(...analytics.peakBookingHours.map((item) => item.count), 1)
  const totalTracked = analytics.totalTrackedBookings || 0
  const pendingCount = sortedBookings.filter((booking) => booking.status === 'PENDING').length
  const approvedCount = sortedBookings.filter((booking) => booking.status === 'APPROVED').length
  const rejectedCount = sortedBookings.filter((booking) => booking.status === 'REJECTED').length
  const cancelledCount = sortedBookings.filter((booking) => booking.status === 'CANCELLED').length

  const topResource = analytics.topResources[0]
  const peakHour = analytics.peakBookingHours[0]

  const topResourceShare = topResource ? Math.round((topResource.count / Math.max(totalTracked, 1)) * 100) : 0
  const peakHourShare = peakHour ? Math.round((peakHour.count / Math.max(totalTracked, 1)) * 100) : 0

  const hourChartPoints = analytics.peakBookingHours
    .map((item, index, arr) => {
      const x = arr.length === 1 ? 50 : (index / (arr.length - 1)) * 100
      const y = 100 - (item.count / hourMax) * 100
      return `${x},${y}`
    })
    .join(' ')

  const hourChartAreaPoints = hourChartPoints ? `${hourChartPoints} 100,100 0,100` : ''

  return (
    <>
      <QRScanner />
      <div className="booking-content admin-layout">
        <article className="card reveal analytics-card">
          <div className="table-head">
            <h2>Usage Analytics</h2>
            <div className="analytics-actions">
              <span className="analytics-total">Tracked: {analytics.totalTrackedBookings}</span>
              <button type="button" className="report-btn" onClick={downloadReport} disabled={isLoadingBookings || isLoadingAnalytics}>
                Download report PDF
              </button>
            </div>
          </div>

          {isLoadingAnalytics ? <p className="empty">Loading analytics...</p> : null}

          {!isLoadingAnalytics ? (
            <>
              <div className="analytics-kpis">
                <article className="analytics-kpi-card">
                  <p>Total tracked</p>
                  <strong>{totalTracked}</strong>
                </article>
                <article className="analytics-kpi-card pending">
                  <p>Pending now</p>
                  <strong>{pendingCount}</strong>
                </article>
                <article className="analytics-kpi-card approved">
                  <p>Approved</p>
                  <strong>{approvedCount}</strong>
                </article>
                <article className="analytics-kpi-card rejected">
                  <p>Rejected / Cancelled</p>
                  <strong>{rejectedCount + cancelledCount}</strong>
                </article>
              </div>

              <div className="analytics-visual-grid">
                <section className="analytics-visual-card analytics-visual-card-share">
                  <h3 className="analytics-title">Top Resource Share</h3>
                  <p className="analytics-subtitle">Most requested resource across tracked bookings</p>
                  <div className="analytics-ring-wrap">
                    <div
                      className="analytics-ring"
                      style={{
                        background: `conic-gradient(#0d7580 ${topResourceShare}%, rgba(13, 117, 128, 0.16) ${topResourceShare}% 100%)`,
                      }}
                    >
                      <div className="analytics-ring-inner">
                        <strong>{topResourceShare}%</strong>
                        <span>of tracked</span>
                      </div>
                    </div>
                    <div className="analytics-visual-note">
                      <p>{topResource?.label || 'No resource data'}</p>
                      <strong>{topResource?.count || 0} bookings</strong>
                    </div>
                  </div>
                </section>

                <section className="analytics-visual-card analytics-visual-card-trend">
                  <h3 className="analytics-title">Hourly Demand Trend</h3>
                  <p className="analytics-subtitle">Demand distribution by booking start hour</p>
                  {analytics.peakBookingHours.length === 0 ? (
                    <p className="empty">No hourly booking data.</p>
                  ) : (
                    <>
                      <div className="analytics-trend-head">
                        <span className="analytics-trend-label">Peak load</span>
                        <strong className="analytics-trend-value">{peakHour?.count || 0} bookings</strong>
                      </div>
                      <div className="analytics-line-chart" role="img" aria-label="Peak booking hour trend chart">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="75" x2="100" y2="75" className="analytics-grid-line" />
                          <line x1="0" y1="50" x2="100" y2="50" className="analytics-grid-line" />
                          <line x1="0" y1="25" x2="100" y2="25" className="analytics-grid-line" />
                          <polygon points={hourChartAreaPoints} className="analytics-area" />
                          <polyline points={hourChartPoints} className="analytics-line" />
                          {analytics.peakBookingHours.map((item, index, arr) => {
                            const x = arr.length === 1 ? 50 : (index / (arr.length - 1)) * 100
                            const y = 100 - (item.count / hourMax) * 100
                            return <circle key={`hour-point-${item.label}`} cx={x} cy={y} r="2.3" className="analytics-point" />
                          })}
                        </svg>
                      </div>
                      <div className="analytics-axis-labels">
                        <span>{analytics.peakBookingHours[0]?.label}</span>
                        <span>{analytics.peakBookingHours[analytics.peakBookingHours.length - 1]?.label}</span>
                      </div>
                      <div className="analytics-chart-meta">
                        <span className="analytics-meta-chip">Trend line</span>
                        <span className="analytics-meta-chip">Bookings per hour</span>
                      </div>
                      <p className="analytics-peak-note">
                        Peak hour: <strong>{peakHour?.label || 'N/A'}</strong> ({peakHour?.count || 0} bookings, {peakHourShare}% of tracked)
                      </p>
                    </>
                  )}
                </section>
              </div>

              <div className="analytics-grid">
                <section>
                <h3 className="analytics-title">Top Resources</h3>
                {analytics.topResources.length === 0 ? (
                  <p className="empty">No resource usage data.</p>
                ) : (
                  <div className="analytics-list">
                    {analytics.topResources.map((item) => (
                      <div key={`resource-${item.label}`} className="analytics-row">
                        <div className="analytics-row-head">
                          <span>{item.label}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="analytics-bar-track">
                          <div
                            className="analytics-bar-fill"
                            style={{ width: `${Math.max(8, (item.count / resourceMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

                <section>
                <h3 className="analytics-title">Peak Booking Hours</h3>
                {analytics.peakBookingHours.length === 0 ? (
                  <p className="empty">No hourly booking data.</p>
                ) : (
                  <div className="analytics-list">
                    {analytics.peakBookingHours.map((item) => (
                      <div key={`hour-${item.label}`} className="analytics-row">
                        <div className="analytics-row-head">
                          <span>{item.label}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="analytics-bar-track">
                          <div
                            className="analytics-bar-fill hour"
                            style={{ width: `${Math.max(8, (item.count / hourMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              </div>
            </>
          ) : null}
        </article>

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
