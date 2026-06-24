import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Home = () => {
  const { settings } = useSettings();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Experience the <span>Luxury</span> of Freedom
          </h1>
          <p>
            Rent premium vehicles dynamically. From sleek sports cars to spacious family SUVs, find the perfect ride configured just for your journey. No hassles, just premium travel.
          </p>
          <div className="hero-actions">
            <Link to="/cars" className="nav-btn nav-btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Explore Cars
            </Link>
            <Link to="/tracker" className="nav-btn nav-btn-outline" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Track Booking
            </Link>
          </div>
        </div>

        <div className="hero-image">
          {/* Custom SVG premium sports car illustration */}
          <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
            <defs>
              <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#111827" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Background Glow */}
            <circle cx="300" cy="150" r="120" fill="#2563eb" opacity="0.12" filter="url(#glow)" />
            {/* Road lines */}
            <line x1="50" y1="230" x2="550" y2="230" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" />
            <line x1="150" y1="230" x2="450" y2="230" stroke="#3b82f6" strokeWidth="4" opacity="0.4" />
            
            {/* Car Shadow */}
            <ellipse cx="300" cy="225" rx="200" ry="12" fill="#000" opacity="0.6" />

            {/* Car Body Base */}
            <path d="M120 180 C120 180 150 140 210 135 C270 130 330 110 390 135 C450 160 480 170 490 185 C500 200 480 205 450 205 C420 205 180 205 150 205 C120 205 120 180 120 180 Z" fill="url(#carBodyGrad)" />
            
            {/* Car Cabin/Window area */}
            <path d="M220 137 C220 137 250 100 310 100 C370 100 400 135 400 135 Z" fill="#0b0f19" stroke="#3b82f6" strokeWidth="2" />
            <path d="M310 100 L310 137" stroke="#3b82f6" strokeWidth="2" />

            {/* Spoiler */}
            <path d="M120 175 L100 165 L105 160 L125 170 Z" fill="#1d4ed8" />

            {/* Headlights & Taillights */}
            <path d="M485 180 L495 182 L490 190 Z" fill="#60a5fa" filter="url(#glow)" />
            <path d="M120 178 L115 180 L117 186 Z" fill="#ef4444" />

            {/* Wheels */}
            {/* Back Wheel */}
            <circle cx="200" cy="210" r="32" fill="url(#wheelGrad)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
            <circle cx="200" cy="210" r="16" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
            <circle cx="200" cy="210" r="5" fill="#f9fafb" />
            {/* Front Wheel */}
            <circle cx="400" cy="210" r="32" fill="url(#wheelGrad)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
            <circle cx="400" cy="210" r="16" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
            <circle cx="400" cy="210" r="5" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Trust Badges / USP Section */}
      <section className="container" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700' }}>Fully Insured</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All our rental vehicles are fully insured so you can drive with absolute peace of mind.</p>
          </div>

          <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700' }}>Maintained Fleets</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vehicles undergo constant inspections and routine maintenance schedules to assure peak safety.</p>
          </div>

          <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700' }}>24/7 Support</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Got issues or queries? Contact our dedicated business helpline anytime, anywhere.</p>
          </div>
        </div>
      </section>

      {/* Featured Fleet Preview */}
      <section className="container" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
        <div className="section-header">
          <h2>Our Featured Fleet</h2>
          <p>Choose from a curated collection of standard and luxury cars</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/cars" className="nav-btn nav-btn-outline" style={{ display: 'inline-block', padding: '12px 35px' }}>
            Browse Entire Inventory →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
