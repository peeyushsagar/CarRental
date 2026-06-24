import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>{settings.businessName}</h3>
            <p>
              Premium car rental services delivering comfort, safety, and reliability. Experience hassle-free booking and drive with style.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cars">Browse Vehicles</Link></li>
              <li><Link to="/tracker">Track My Booking</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#refund">Refund Policy</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Contact Info</h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '8px' }}>
                📍 {settings.address}
              </li>
              <li style={{ marginBottom: '8px' }}>
                📞 {settings.phone}
              </li>
              <li style={{ marginBottom: '8px' }}>
                ✉️ {settings.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {settings.businessName}. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '15px' }}>
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
