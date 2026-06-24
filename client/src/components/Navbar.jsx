import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        {settings.logoUrl ? (
          <img src={settings.logoUrl.startsWith('http') ? settings.logoUrl : `${API_BASE_URL}${settings.logoUrl}`} alt="logo" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2563eb', fontSize: '1.6rem' }}>⚡</span>
            <span>{settings.businessName}</span>
          </div>
        )}
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/cars" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Browse Cars
          </NavLink>
        </li>
        <li>
          <NavLink to="/tracker" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Track Booking
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Contact
          </NavLink>
        </li>
      </ul>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '1.1rem',
            transition: 'var(--transition)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Desktop Navigation User Actions */}
        <div className="nav-user-desktop" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hi, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> ({user.role})
              </span>
              {isAdmin ? (
                <Link to="/admin" className="nav-btn nav-btn-primary">
                  Admin Panel
                </Link>
              ) : (
                <Link to="/bookings" className="nav-btn nav-btn-primary">
                  My Bookings
                </Link>
              )}
              <Link to="/profile" className="nav-btn nav-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                👤 Profile
              </Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline">
                Login
              </Link>
              <Link to="/register" className="nav-btn nav-btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger menu toggle */}
        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/cars" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}>
              Browse Cars
            </NavLink>
          </li>
          <li>
            <NavLink to="/tracker" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}>
              Track Booking
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}>
              Contact
            </NavLink>
          </li>
        </ul>
        
        <div className="mobile-nav-user">
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Hi, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> ({user.role})
              </span>
              {isAdmin ? (
                <Link to="/admin" className="nav-btn nav-btn-primary" style={{ textAlign: 'center' }}>
                  Admin Panel
                </Link>
              ) : (
                <Link to="/bookings" className="nav-btn nav-btn-primary" style={{ textAlign: 'center' }}>
                  My Bookings
                </Link>
              )}
              <Link to="/profile" className="nav-btn nav-btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                👤 Profile
              </Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline" style={{ textAlign: 'center' }}>
                Login
              </Link>
              <Link to="/register" className="nav-btn nav-btn-primary" style={{ textAlign: 'center' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
