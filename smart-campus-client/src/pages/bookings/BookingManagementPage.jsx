import { useEffect, useMemo, useState } from 'react'
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getAdminBookingAnalytics,
  getAllBookingsForAdmin,
  getAvailableResources,
  getMyBookings,
  rejectBooking,
  updateMyBooking,
} from '../../api/bookingApi'
import { useAuth } from '../../context/AuthContext'
import { notifyUserDashboardMetricsChanged } from '../../utils/dashboardMetricsEvents'
import BookingAdminPage from './BookingAdminPage'
import BookingUserPage from './BookingUserPage'
import './BookingManagementPage.css'

const initialForm = {
  resourceId: '',
  resourceName: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
}

const BOOKING_WINDOW_START = '08:30'
const BOOKING_WINDOW_END = '17:00'

export default function BookingManagementPage({ initialMode = 'USER', showModeSwitch = true }) {
  const adminShellEmbed = initialMode === 'ADMIN' && !showModeSwitch;
  const { user: authUser } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [statusFilter, setStatusFilter] = useState('')
  const [adminStatusFilter, setAdminStatusFilter] = useState('')
  const [adminRequesterFilter, setAdminRequesterFilter] = useState('')
  const [decisionInputs, setDecisionInputs] = useState({})
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalTrackedBookings: 0,
    topResources: [],
    peakBookingHours: [],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loggedIdentity = useMemo(
    () => ({
      userId: authUser?.id || authUser?.email || '',
      userName: authUser?.name || authUser?.email || '',
    }),
    [authUser],
  )

  useEffect(() => {
    if (mode === 'USER') {
      loadResources()
      loadBookings()
      return
    }

    loadAdminBookings()
    loadAdminAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, statusFilter, loggedIdentity.userId, adminStatusFilter, adminRequesterFilter])

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
    if (!loggedIdentity.userId.trim()) {
      setBookings([])
      return
    }

    setIsLoadingBookings(true)
    setError('')

    try {
      const data = await getMyBookings(
        { userId: loggedIdentity.userId.trim(), userName: loggedIdentity.userName.trim() },
        statusFilter,
      )
      setBookings(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  async function loadAdminBookings() {
    setIsLoadingBookings(true)
    setError('')

    try {
      const data = await getAllBookingsForAdmin(adminStatusFilter, adminRequesterFilter.trim())
      setBookings(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  async function loadAdminAnalytics() {
    setIsLoadingAnalytics(true)
    try {
      const data = await getAdminBookingAnalytics()
      setAnalytics(data)
    } catch (analyticsError) {
      setError(analyticsError.message)
      setAnalytics({
        totalTrackedBookings: 0,
        topResources: [],
        peakBookingHours: [],
      })
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  async function handleCreateBooking(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!loggedIdentity.userId.trim()) {
      setError('No authenticated user found. Please sign in again.')
      return
    }

    const attendees = form.expectedAttendees ? Number(form.expectedAttendees) : null

    if (form.startTime && form.endTime) {
      if (form.startTime < BOOKING_WINDOW_START || form.endTime > BOOKING_WINDOW_END) {
        setError('Booking time must be between 08:30 and 17:00.')
        return
      }

      if (form.startTime >= form.endTime) {
        setError('Start time must be before end time.')
        return
      }
    }

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
      if (editingBookingId) {
        await updateMyBooking(editingBookingId, payload, {
          userId: loggedIdentity.userId.trim(),
          userName: loggedIdentity.userName.trim(),
        })
        setSuccess('Booking updated successfully.')
      } else {
        const created = await createBooking(payload, {
          userId: loggedIdentity.userId.trim(),
          userName: loggedIdentity.userName.trim(),
        })
        setSuccess(`Booking created as ${created.status}.`)
      }

      setForm(initialForm)
      setEditingBookingId(null)
      await loadBookings()
      if (mode === 'USER') notifyUserDashboardMetricsChanged()
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
        userId: loggedIdentity.userId.trim(),
        userName: loggedIdentity.userName.trim(),
      })
      setSuccess('Booking cancelled successfully.')
      await loadBookings()
      if (mode === 'USER') notifyUserDashboardMetricsChanged()
    } catch (cancelError) {
      setError(cancelError.message)
    }
  }

  async function handleApproveBooking(bookingId) {
    setError('')
    setSuccess('')

    if (!loggedIdentity.userId.trim()) {
      setError('No authenticated user found. Please sign in again.')
      return
    }

    try {
      await approveBooking(
        bookingId,
        {
          userId: loggedIdentity.userId.trim(),
          userName: loggedIdentity.userName.trim(),
        },
        decisionInputs[bookingId],
      )
      setSuccess('Booking approved successfully.')
      setDecisionInputs((prev) => ({ ...prev, [bookingId]: '' }))
      await loadAdminBookings()
      await loadAdminAnalytics()
    } catch (approveError) {
      setError(approveError.message)
    }
  }

  async function handleRejectBooking(bookingId) {
    setError('')
    setSuccess('')

    if (!loggedIdentity.userId.trim()) {
      setError('No authenticated user found. Please sign in again.')
      return
    }

    const reason = decisionInputs[bookingId]?.trim()
    if (!reason) {
      setError('Reason is required to reject a booking.')
      return
    }

    try {
      await rejectBooking(
        bookingId,
        {
          userId: loggedIdentity.userId.trim(),
          userName: loggedIdentity.userName.trim(),
        },
        reason,
      )
      setSuccess('Booking rejected successfully.')
      setDecisionInputs((prev) => ({ ...prev, [bookingId]: '' }))
      await loadAdminBookings()
      await loadAdminAnalytics()
    } catch (rejectError) {
      setError(rejectError.message)
    }
  }

  function updateFormField(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleResourceSelect(event) {
    const selectedId = event.target.value
    const selectedResource = resources.find((r) => r.id === selectedId)
    setForm((previous) => ({
      ...previous,
      resourceId: selectedId,
      resourceName: selectedResource?.name || '',
      expectedAttendees:
        selectedResource?.capacity && Number(previous.expectedAttendees) > selectedResource.capacity
          ? String(selectedResource.capacity)
          : previous.expectedAttendees,
    }))
  }

  function handleModeToggle() {
    setMode((previous) => (previous === 'USER' ? 'ADMIN' : 'USER'))
    setError('')
    setSuccess('')
    setEditingBookingId(null)
    setForm(initialForm)
  }

  function handleStartEditBooking(booking) {
    if (booking.status !== 'PENDING') {
      return
    }

    setEditingBookingId(booking.id)
    setForm({
      resourceId: booking.resourceId || '',
      resourceName: booking.resourceName || '',
      bookingDate: booking.bookingDate || '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      purpose: booking.purpose || '',
      expectedAttendees: booking.expectedAttendees ?? '',
    })
    setError('')
    setSuccess('')
  }

  function handleCancelEditBooking() {
    setEditingBookingId(null)
    setForm(initialForm)
  }

  return (
    <section className={`booking-page${adminShellEmbed ? ' booking-page--admin-shell' : ''}`}>
      {adminShellEmbed && mode === 'ADMIN' ? (
        <section className="admin-users-hero" aria-labelledby="booking-admin-hero-title">
          <div className="admin-users-hero-inner">
            <div className="admin-users-hero-copy">
              <span className="admin-users-hero-kicker">Bookings</span>
              <h1 id="booking-admin-hero-title" className="admin-users-hero-title">
                Booking approvals
              </h1>
              <p className="admin-users-hero-lead">
                Review requests, use filters, and approve or reject pending bookings with a clear reason.
              </p>
            </div>
            <div className="admin-users-hero-accent" aria-hidden>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="56" height="56">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.25}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </section>
      ) : (
        <header className="booking-header">
          <div className="header-top">
            <p className="kicker">Smart Campus</p>
            {showModeSwitch ? (
              <button className="mode-switch" type="button" onClick={handleModeToggle}>
                Switch to {mode === 'USER' ? 'Admin' : 'User'}
              </button>
            ) : null}
          </div>
          <h1>{mode === 'USER' ? 'Booking Management' : 'Admin Booking Review'}</h1>
          <p className="subtitle">
            {mode === 'USER'
              ? 'Request resources, check approval state, and cancel approved bookings from one place.'
              : 'Review all booking requests, apply filters, and approve or reject pending requests with a reason.'}
          </p>
        </header>
      )}

      {mode === 'USER' ? (
        <BookingUserPage
          resources={resources}
          selectedResource={resources.find((resource) => resource.id === form.resourceId) || null}
          bookingWindowStart={BOOKING_WINDOW_START}
          bookingWindowEnd={BOOKING_WINDOW_END}
          isLoadingResources={isLoadingResources}
          form={form}
          isSubmitting={isSubmitting}
          statusFilter={statusFilter}
          isLoadingBookings={isLoadingBookings}
          sortedBookings={sortedBookings}
          onFormChange={updateFormField}
          onResourceSelect={handleResourceSelect}
          onSubmit={handleCreateBooking}
          onStatusFilterChange={setStatusFilter}
          onCancelBooking={handleCancelBooking}
          onStartEditBooking={handleStartEditBooking}
          onCancelEditBooking={handleCancelEditBooking}
          isEditMode={Boolean(editingBookingId)}
          error={error}
          success={success}
        />
      ) : (
        <BookingAdminPage
          isLoadingBookings={isLoadingBookings}
          sortedBookings={sortedBookings}
          analytics={analytics}
          isLoadingAnalytics={isLoadingAnalytics}
          statusFilter={adminStatusFilter}
          requesterFilter={adminRequesterFilter}
          decisionInputs={decisionInputs}
          onStatusFilterChange={setAdminStatusFilter}
          onRequesterFilterChange={setAdminRequesterFilter}
          onDecisionInputChange={(bookingId, value) =>
            setDecisionInputs((previous) => ({
              ...previous,
              [bookingId]: value,
            }))
          }
          onApproveBooking={handleApproveBooking}
          onRejectBooking={handleRejectBooking}
          error={error}
          success={success}
        />
      )}
    </section>
  )
}
