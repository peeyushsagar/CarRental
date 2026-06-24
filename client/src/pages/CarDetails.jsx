import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/cars/${id}`);
        setCar(data);
      } catch (error) {
        console.error('Error fetching car details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${car._id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '6rem 0' }}>
        <h3>Loading vehicle details...</h3>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container" style={{ textAlign: 'center', margin: '6rem 0' }}>
        <h2>Vehicle Not Found</h2>
        <p>The vehicle you are looking for does not exist or has been removed.</p>
        <Link to="/cars" className="nav-btn nav-btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  // SVG placeholder
  const renderCarPlaceholder = () => (
    <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', height: '80%' }}>
      <path d="M20 70 C20 70 35 45 60 40 C85 35 110 25 150 40 C190 55 195 65 195 75 C195 75 180 77 150 77 L50 77 Z" fill="#3b82f6" opacity="0.8" />
      <path d="M70 42 C70 42 85 20 120 20 C155 20 160 42 160 42 Z" fill="#111827" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="55" cy="78" r="14" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
      <circle cx="155" cy="78" r="14" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <Link to="/cars" style={{ color: 'var(--accent-light)', fontWeight: '500' }}>
        ← Back to Browse
      </Link>

      <div className="details-grid">
        {/* Gallery */}
        <div className="car-gallery">
          <div className="gallery-main glass">
            {car.images && car.images.length > 0 ? (
              <img src={car.images[activeImage].startsWith('http') ? car.images[activeImage] : `${API_BASE_URL}${car.images[activeImage]}`} alt={car.name} />
            ) : (
              renderCarPlaceholder()
            )}
          </div>

          {car.images && car.images.length > 1 && (
            <div className="gallery-thumbs">
              {car.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details & Action */}
        <div className="glass animate-fade-in" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <span className="car-brand" style={{ fontSize: '0.95rem' }}>{car.brand}</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.5rem 0 1.5rem 0', lineHeight: '1.2' }}>
            {car.name}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>Daily Price</span>
              {car.discount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1rem' }}>₹{car.pricePerDay}</span>
                  <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>₹{Math.round(car.pricePerDay * (1 - car.discount / 100))}</strong>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{car.discount}% OFF</span>
                </div>
              ) : (
                <strong style={{ fontSize: '1.5rem', color: '#10b981', display: 'block', marginTop: '4px' }}>₹{car.pricePerDay}</strong>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>Availability Status</span>
              <span className={`car-badge badge-${car.status}`} style={{ position: 'static', display: 'inline-block', marginTop: '6px' }}>
                {car.status}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Vehicle Specifications
            </h3>
            
            <table style={{ width: '100%', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>Transmission</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{car.transmission}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>Fuel Type</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{car.fuelType}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>Model Year</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{car.year}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>Exterior Color</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{car.color || 'Unspecified'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {car.status === 'maintenance' ? (
            <div className="alert alert-warning" style={{ margin: 0 }}>
              <strong>Maintenance Mode:</strong> This vehicle is temporarily unavailable due to scheduled maintenance. Please choose another vehicle or check back later.
            </div>
          ) : car.status === 'inactive' ? (
            <div className="alert alert-danger" style={{ margin: 0 }}>
              This vehicle is currently inactive and cannot be rented.
            </div>
          ) : (
            <button onClick={handleBookNow} className="btn-full" style={{ padding: '14px', fontSize: '1.05rem' }}>
              {user ? 'Proceed to Booking' : 'Login to Book Vehicle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
