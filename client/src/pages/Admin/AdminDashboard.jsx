import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/bookings/stats/dashboard`);
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage cars, bookings, notifications and analytics</p>
          </div>
          <span className="glass" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600' }}>
            Logged in as: <span style={{ color: 'var(--accent-light)' }}>{user.name}</span>
          </span>
        </div>

        {loading ? (
          <div>
            <h3>Loading dashboard metrics...</h3>
          </div>
        ) : !stats ? (
          <div className="alert alert-danger">Error connecting to statistics server.</div>
        ) : (
          <>
            {/* Stat Row */}
            <div className="stats-row">
              <div className="stat-card glass">
                <span className="stat-label">Total Fleet</span>
                <span className="stat-value">{stats.totalCars}</span>
                <span className="stat-trend trend-up">Cars registered</span>
              </div>
              <div className="stat-card glass">
                <span className="stat-label">Available Vehicles</span>
                <span className="stat-value" style={{ color: '#10b981' }}>{stats.availableCars}</span>
                <span className="stat-trend">Ready for rent</span>
              </div>
              <div className="stat-card glass">
                <span className="stat-label">Under Maintenance</span>
                <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.maintenanceCars}</span>
                <span className="stat-trend trend-down">Temporarily blocked</span>
              </div>
              <div className="stat-card glass">
                <span className="stat-label">Pending Requests</span>
                <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.pendingBookings}</span>
                <span className="stat-trend">Needs verification</span>
              </div>
              <div className="stat-card glass" style={{ gridColumn: 'span 2' }}>
                <span className="stat-label">Gross Revenue</span>
                <span className="stat-value" style={{ color: '#10b981' }}>₹{stats.totalRevenue}</span>
                <span className="stat-trend trend-up">Completed rents</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="glass" style={{ padding: '2rem', height: '400px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Revenue Analytics</h3>
              
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '80%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No completed booking revenue logs available for plotting.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
