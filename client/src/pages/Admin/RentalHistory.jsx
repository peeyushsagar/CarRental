import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const RentalHistory = () => {
  const { isSuperAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchRentalHistory = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bookings`);
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rental history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  const handleCustomerClick = (booking) => {
    const email = booking.customerDetails?.email;
    if (!email) return;

    // Filter all bookings associated with this customer
    const customerBookings = bookings.filter(b => b.customerDetails?.email === email);
    
    // Calculate total completed/confirmed rental days
    const totalDays = customerBookings.reduce((sum, b) => {
      if (b.status === 'confirmed' || b.status === 'completed') {
        const days = Math.ceil(Math.abs(new Date(b.returnDate) - new Date(b.pickupDate)) / (1000 * 60 * 60 * 24)) || 1;
        return sum + days;
      }
      return sum;
    }, 0);

    const totalApproved = customerBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;

    // Build the user details payload
    const userPayload = {
      name: booking.customerDetails?.name || 'Unknown',
      email: booking.customerDetails?.email || 'N/A',
      phone: booking.customerDetails?.phone || 'N/A',
      address: booking.customerDetails?.address || 'N/A',
      aadhaar: booking.customerDetails?.aadhaar || 'N/A',
      drivingLicense: booking.customerDetails?.drivingLicense || 'N/A',
      aadhaarImage: booking.aadhaarImage || '',
      drivingLicenseImage: booking.drivingLicenseImage || '',
      emergencyContact: booking.customerDetails?.emergencyContact || 'N/A',
      joiningDate: booking.customerId?.createdAt || null,
      totalBookings: customerBookings.length,
      totalCompletedBookings: totalApproved,
      totalRentalDays: totalDays,
      history: customerBookings.map(b => ({
        bookingId: b.bookingId,
        carName: b.carId ? `${b.carId.brand} ${b.carId.name}` : 'Deleted Car',
        pickupDate: b.pickupDate,
        returnDate: b.returnDate,
        totalAmount: b.totalAmount,
        status: b.status,
      })),
    };

    setSelectedUser(userPayload);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
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
          Overview
        </NavLink>
        <NavLink to="/admin/cars" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          Manage Cars
        </NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          Manage Bookings
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          Registered Users
        </NavLink>
        <NavLink to="/admin/history" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          Rental History
        </NavLink>
        {isSuperAdmin && (
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            Business Settings
          </NavLink>
        )}
      </aside>

      {/* Main dashboard content */}
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Rental History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Audit timestamps, customer details, and rented vehicle models</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <h3>Loading rental logs...</h3>
        ) : bookings.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No bookings have been logged yet.</p>
          </div>
        ) : (
          <div className="table-card glass">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Customer Name (Click for Details)</th>
                  <th>Car Model</th>
                  <th>Rental Window</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {new Date(b.createdAt).toLocaleDateString()} at{' '}
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <strong 
                        style={{ color: 'var(--accent-light)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleCustomerClick(b)}
                        title="Click to view full user profile & dossier"
                      >
                        {b.customerDetails?.name || 'Unknown'}
                      </strong>
                    </td>
                    <td>
                      {b.carId ? `${b.carId.brand} ${b.carId.name}` : <span style={{ color: '#ef4444' }}>Deleted Car</span>}
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>
                      {new Date(b.pickupDate).toLocaleDateString()} to {new Date(b.returnDate).toLocaleDateString()}
                    </td>
                    <td><strong style={{ color: '#10b981' }}>₹{b.totalAmount}</strong></td>
                    <td>
                      <span className={`car-badge ${getStatusBadgeClass(b.status)}`} style={{ position: 'static', padding: '4px 10px' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Renter Details Dossier Modal */}
      {showModal && selectedUser && (
        <div className="modal-backdrop" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '700px', maxHeight: '90vh', borderRadius: '16px', border: '1px solid var(--border)', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>User Security Dossier</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedUser.name} &bull; {selectedUser.email}</p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              
              {/* Contact & Physical Address */}
              <div className="responsive-grid-2" style={{ marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Primary Phone</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedUser.phone}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Emergency Contact</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedUser.emergencyContact}</span>
                </div>
                <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Permanent Address</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{selectedUser.address}</span>
                </div>
              </div>

              {/* Document references */}
              <div className="responsive-grid-2" style={{ marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Aadhaar Card Reference</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-light)', fontSize: '1.1rem' }}>{selectedUser.aadhaar}</span>
                  {selectedUser.aadhaarImage ? (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img 
                        src={selectedUser.aadhaarImage.startsWith('http') ? selectedUser.aadhaarImage : `${API_BASE_URL}${selectedUser.aadhaarImage}`} 
                        alt="Aadhaar Card" 
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}
                      />
                      <a 
                        href={selectedUser.aadhaarImage.startsWith('http') ? selectedUser.aadhaarImage : `${API_BASE_URL}${selectedUser.aadhaarImage}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'block', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-light)', textDecoration: 'underline' }}
                      >
                        Open in New Tab
                      </a>
                    </div>
                  ) : (
                    <span style={{ display: 'block', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Aadhaar Image Uploaded</span>
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Driving License Reference</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-light)', fontSize: '1.1rem' }}>{selectedUser.drivingLicense}</span>
                  {selectedUser.drivingLicenseImage ? (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img 
                        src={selectedUser.drivingLicenseImage.startsWith('http') ? selectedUser.drivingLicenseImage : `${API_BASE_URL}${selectedUser.drivingLicenseImage}`} 
                        alt="Driving License" 
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}
                      />
                      <a 
                        href={selectedUser.drivingLicenseImage.startsWith('http') ? selectedUser.drivingLicenseImage : `${API_BASE_URL}${selectedUser.drivingLicenseImage}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'block', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-light)', textDecoration: 'underline' }}
                      >
                        Open in New Tab
                      </a>
                    </div>
                  ) : (
                    <span style={{ display: 'block', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No License Image Uploaded</span>
                  )}
                </div>
              </div>

              {/* Renter Statistics summary */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '2rem' }}>
                <div className="glass" style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Booking Inquiries</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{selectedUser.totalBookings}</div>
                </div>
                <div className="glass" style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rents Executed</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px', color: '#10b981' }}>{selectedUser.totalCompletedBookings}</div>
                </div>
                <div className="glass" style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cumulated Rental Time</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px', color: '#3b82f6' }}>{selectedUser.totalRentalDays} <span style={{ fontSize: '0.9rem' }}>days</span></div>
                </div>
              </div>

              {/* Booking History Table */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Customer Booking History Ledger</h3>
              <div className="table-card glass" style={{ border: '1px solid var(--border)' }}>
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vehicle</th>
                      <th>Timeframe</th>
                      <th>Charges</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.history.map((h, idx) => (
                      <tr key={idx}>
                        <td><strong style={{ color: 'var(--accent-light)' }}>{h.bookingId}</strong></td>
                        <td>{h.carName}</td>
                        <td>
                          {new Date(h.pickupDate).toLocaleDateString()} to {new Date(h.returnDate).toLocaleDateString()}
                        </td>
                        <td>₹{h.totalAmount}</td>
                        <td>
                          <span className={`car-badge ${getStatusBadgeClass(h.status)}`} style={{ position: 'static', padding: '3px 8px', fontSize: '0.7rem' }}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button className="btn-full" onClick={closeModal} style={{ marginTop: '2rem', padding: '12px' }}>
              Close dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistory;
