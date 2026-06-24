import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const ManageUsers = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setError('');
    try {
      await axios.put(`${API_BASE_URL}/api/auth/users/${userId}/status`, { status: newStatus });
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        closeModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user account.');
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Registered Users Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View joining details, system roles, and account access logs</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <h3>Loading users directory...</h3>
        ) : users.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No registered users found.</p>
          </div>
        ) : (
          <div className="table-card glass">
            <table className="table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                  <th>Total Logins</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(u)}>
                    <td>
                      <strong style={{ color: 'var(--accent-light)' }}>{u.name}</strong>
                      {currentUser && currentUser._id === u._id && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>(You)</span>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`car-badge ${u.role === 'customer' ? 'badge-available' : 'badge-maintenance'}`} style={{ position: 'static', textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`car-badge ${u.status === 'blocked' ? 'badge-booked' : 'badge-available'}`} style={{ position: 'static', textTransform: 'uppercase' }}>
                        {u.status || 'active'}
                      </span>
                      {u.deletionRequested && (
                        <span className="car-badge badge-booked" style={{ position: 'static', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', marginLeft: '6px' }}>
                          deletion requested
                        </span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()} {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{u.loginLogs ? u.loginLogs.length : 0}</td>
                    <td>
                      <div className="btn-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn-icon" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--accent-light)', borderColor: 'var(--border)' }}
                          onClick={() => handleUserClick(u)}
                        >
                          Logs
                        </button>
                        {currentUser && currentUser._id !== u._id && u.role !== 'superadmin' && (
                          <>
                            <button
                              className="btn-icon"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.8rem', 
                                color: u.status === 'blocked' ? 'var(--success)' : 'var(--danger)', 
                                borderColor: u.status === 'blocked' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                background: u.status === 'blocked' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                              }}
                              onClick={() => handleToggleBlock(u._id, u.status)}
                            >
                              {u.status === 'blocked' ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail & Logs Modal */}
      {showModal && selectedUser && (
        <div className="modal-backdrop" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '550px', maxHeight: '90vh', borderRadius: '16px', border: '1px solid var(--border)', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {selectedUser.profileImage ? (
                  <img 
                    src={selectedUser.profileImage.startsWith('http') ? selectedUser.profileImage : `${API_BASE_URL}${selectedUser.profileImage}`} 
                    alt="avatar" 
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
                  />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{selectedUser.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '15px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>System Role</span>
                <span style={{ fontWeight: '600' }}>{selectedUser.role.toUpperCase()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Account Status</span>
                <span className={`car-badge ${selectedUser.status === 'blocked' ? 'badge-booked' : 'badge-available'}`} style={{ position: 'static', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
                  {selectedUser.status || 'active'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Mobile Number</span>
                <span style={{ fontWeight: '600', color: 'var(--accent-light)' }}>{selectedUser.phone || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Joining Date</span>
                <span style={{ fontWeight: '600' }}>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedUser.deletionRequested && (
                <div style={{ gridColumn: 'span 2', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 15px', borderRadius: '8px', color: '#f87171', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>User has requested account deletion!</span>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Login Session History</h3>

            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', minHeight: '120px', maxHeight: '250px' }}>
              {selectedUser.loginLogs && selectedUser.loginLogs.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {selectedUser.loginLogs.map((log, index) => (
                    <li key={index} style={{ padding: '8px 12px', borderBottom: index === selectedUser.loginLogs.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Session #{selectedUser.loginLogs.length - index}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {new Date(log).toLocaleDateString()} at {new Date(log).toLocaleTimeString()}
                      </strong>
                    </li>
                  )).reverse()}
                </ul>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No logins logged yet.
                </div>
              )}
            </div>

            {currentUser && currentUser._id !== selectedUser._id && selectedUser.role !== 'superadmin' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  className="btn-full"
                  style={{
                    flex: 1,
                    background: selectedUser.status === 'blocked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: selectedUser.status === 'blocked' ? 'var(--success)' : 'var(--danger)',
                    border: selectedUser.status === 'blocked' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '10px',
                  }}
                  onClick={() => handleToggleBlock(selectedUser._id, selectedUser.status)}
                >
                  {selectedUser.status === 'blocked' ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  className="btn-full btn-danger"
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => handleDeleteUser(selectedUser._id)}
                >
                  Delete User
                </button>
              </div>
            )}

            <button className="btn-full nav-btn-outline" onClick={closeModal} style={{ marginTop: '1rem', padding: '12px' }}>
              Close Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
