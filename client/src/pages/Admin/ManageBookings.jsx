import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const ManageBookings = () => {
  const { isSuperAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bookings`);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, status, paymentStatus = 'pending') => {
    setMsg('');
    setError('');
    
    // Auto-update payment to paid if approved
    const finalPaymentStatus = status === 'confirmed' ? 'paid' : paymentStatus;
    
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${id}/status`, {
        status,
        paymentStatus: finalPaymentStatus,
        paymentId: status === 'confirmed' ? `PAY-${Date.now()}` : undefined,
      });
      setMsg(`Booking status updated to ${status.toUpperCase()} successfully.`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-maintenance';
      case 'confirmed': return 'badge-available';
      case 'rejected': return 'badge-booked';
      case 'completed': return 'badge-available';
      default: return '';
    }
  };

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          📊 Overview
        </NavLink>
        <NavLink to="/admin/cars" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          🚗 Manage Cars
        </NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          📅 Manage Bookings
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          👥 Registered Users
        </NavLink>
        <NavLink to="/admin/history" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          📜 Rental History
        </NavLink>
        {isSuperAdmin && (
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            ⚙️ Business Settings
          </NavLink>
        )}
      </aside>

      {/* Main dashboard content */}
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage Booking Requests</h1>
          <p style={{ color: '#9ca3af' }}>Verify driver licenses, accept or reject booking requests, and log completions</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <h3>Fetching bookings history...</h3>
        ) : bookings.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            <p>No bookings have been submitted yet.</p>
          </div>
        ) : (
          <div className="table-card glass">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Info</th>
                  <th>Vehicle Details</th>
                  <th>Rental Window</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Verification Docs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong style={{ color: '#60a5fa' }}>{b.bookingId}</strong>
                    </td>
                    <td>
                      <div><strong>{b.customerDetails?.name}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>📞 {b.customerDetails?.phone}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>✉️ {b.customerDetails?.email}</div>
                    </td>
                    <td>
                      {b.carId ? `${b.carId.brand} ${b.carId.name}` : 'Deleted Car'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div><strong>Pick:</strong> {new Date(b.pickupDate).toLocaleDateString()}</div>
                        <div><strong>Ret:</strong> {new Date(b.returnDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#10b981', fontWeight: '700' }}>₹{b.totalAmount}</div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: b.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`car-badge ${getStatusBadgeClass(b.status)}`} style={{ position: 'static' }}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                        {b.aadhaarImage ? (
                          <a href={`${API_BASE_URL}${b.aadhaarImage}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                            📄 Aadhaar Image
                          </a>
                        ) : (
                          <span style={{ color: '#6b7280' }}>No Aadhaar Upload</span>
                        )}
                        {b.drivingLicenseImage ? (
                          <a href={`${API_BASE_URL}${b.drivingLicenseImage}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                            📄 DL Image
                          </a>
                        ) : (
                          <span style={{ color: '#6b7280' }}>No DL Upload</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="btn-actions">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                              className="btn-icon btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'rejected')}
                              className="btn-icon btn-danger"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'completed', 'paid')}
                            className="btn-icon"
                            style={{ borderColor: '#60a5fa', color: '#60a5fa' }}
                          >
                            Mark Completed
                          </button>
                        )}
                        {b.status === 'completed' && <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Ended</span>}
                        {b.status === 'rejected' && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Rejected</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageBookings;
