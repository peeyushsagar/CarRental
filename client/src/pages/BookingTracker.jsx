import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const BookingTracker = () => {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId.trim()) return;

    setError('');
    setBooking(null);
    setLoading(true);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId.trim().toUpperCase()}`);
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No booking record found for this reference.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'confirmed': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'rejected': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'completed': return { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      default: return { color: 'var(--text-primary)', background: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="form-card glass" style={{ maxWidth: '650px', margin: '4rem auto' }}>
        <h2 className="form-title" style={{ fontSize: '2rem' }}>Track Booking Status</h2>
        <p className="form-subtitle">Enter your unique Booking Reference (e.g. CR20260001) below</p>

        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="text"
            required
            placeholder="CRXXXXXXXXXX"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button type="submit" className="nav-btn nav-btn-primary" style={{ padding: '0 25px', height: '48px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {error && <div className="alert alert-danger" style={{ textAlign: 'center' }}>{error}</div>}

        {booking && (
          <div className="glass animate-fade-in" style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Reference ID</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-light)' }}>{booking.bookingId}</strong>
              </div>
              <div style={{ ...getStatusStyle(booking.status), padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                {booking.status}
              </div>
            </div>

            <div className="responsive-grid-2" style={{ fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Renter Name</span>
                <span>{booking.customerDetails?.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Vehicle Selected</span>
                <span>{booking.carId?.brand} {booking.carId?.name || booking.carId?.model}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Pickup Location/Date</span>
                <span>{new Date(booking.pickupDate).toDateString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Return Date</span>
                <span>{new Date(booking.returnDate).toDateString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Amount Owed</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>₹{booking.totalAmount}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Payment Status</span>
                <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTracker;
