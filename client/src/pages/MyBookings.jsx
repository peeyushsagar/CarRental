import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/bookings`);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-maintenance'; // orange/yellow
      case 'confirmed': return 'badge-available'; // green
      case 'rejected': return 'badge-booked'; // red
      case 'completed': return 'badge-available'; // green (or blue)
      default: return '';
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title">My Bookings</h1>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <h3>Loading bookings list...</h3>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
          <p>You have not booked any vehicles yet.</p>
        </div>
      ) : (
        <div className="table-card glass">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Vehicle</th>
                <th>Pickup Date</th>
                <th>Return Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong style={{ color: '#60a5fa' }}>{b.bookingId}</strong>
                  </td>
                  <td>
                    {b.carId ? `${b.carId.brand} ${b.carId.name}` : 'Deleted Vehicle'}
                  </td>
                  <td>{new Date(b.pickupDate).toLocaleDateString()}</td>
                  <td>{new Date(b.returnDate).toLocaleDateString()}</td>
                  <td style={{ color: '#10b981', fontWeight: '700' }}>₹{b.totalAmount}</td>
                  <td>
                    <span className={`car-badge ${getStatusBadgeClass(b.status)}`} style={{ position: 'static' }}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', color: b.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
