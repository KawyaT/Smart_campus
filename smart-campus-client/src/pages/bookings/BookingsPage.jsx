import { useEffect, useMemo, useState } from "react";
import BookingAPI from "../../api/bookingAPI";
import "../../styles/OperationsModules.css";

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await BookingAPI.getAll();
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filterStatus === "ALL") {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === filterStatus);
  }, [bookings, filterStatus]);

  if (loading) {
    return <div className="operations-page">Loading bookings...</div>;
  }

  return (
    <div className="operations-page">
      <div className="operations-header">
        <h1>📅 Bookings (View Only)</h1>
      </div>

      <div className="operations-layout" style={{ display: 'block' }}>
        <section className="operations-list">
          <div className="list-filters">
            <button
              className={filterStatus === "ALL" ? "active" : ""}
              onClick={() => setFilterStatus("ALL")}
            >
              All Bookings
            </button>
            <button
              className={filterStatus === "PENDING" ? "active" : ""}
              onClick={() => setFilterStatus("PENDING")}
            >
              Pending
            </button>
            <button
              className={filterStatus === "APPROVED" ? "active" : ""}
              onClick={() => setFilterStatus("APPROVED")}
            >
              Approved
            </button>
            <button
              className={filterStatus === "COMPLETED" ? "active" : ""}
              onClick={() => setFilterStatus("COMPLETED")}
            >
              Completed
            </button>
          </div>

          <div className="list-content">
            {filteredBookings.length === 0 ? (
              <p className="no-data">No bookings found for the selected status.</p>
            ) : (
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Facility</th>
                    <th>Booked By</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.title}</td>
                      <td>{booking.facilityName || booking.facilityId}</td>
                      <td>{booking.bookedBy}</td>
                      <td>
                        {new Date(booking.startTime).toLocaleString()} - <br/>
                        {new Date(booking.endTime).toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BookingsPage;
