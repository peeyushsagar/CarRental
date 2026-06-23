import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const BookingPage = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  // Files
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  // State flags
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/cars/${carId}`);
        setCar(data);
      } catch (error) {
        console.error('Error fetching car info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  // Calculate pricing preview dynamically
  const calculateDaysAndPrice = () => {
    if (!pickupDate || !returnDate || !car) return { days: 0, total: 0 };
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    if (start >= end) return { days: 0, total: 0 };

    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return { days, total: days * car.pricePerDay };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { days } = calculateDaysAndPrice();
    if (days <= 0) {
      return setError('Return date must be after pickup date');
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('carId', carId);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('aadhaar', aadhaar);
    formData.append('drivingLicense', drivingLicense);
    formData.append('emergencyContact', emergencyContact);
    formData.append('address', address);
    formData.append('pickupDate', pickupDate);
    formData.append('returnDate', returnDate);

    if (aadhaarFile) {
      formData.append('aadhaarImage', aadhaarFile);
    }
    if (licenseFile) {
      formData.append('drivingLicenseImage', licenseFile);
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/bookings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while creating your booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const priceDetails = calculateDaysAndPrice();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '6rem 0' }}>
        <h3>Loading booking details...</h3>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container" style={{ textAlign: 'center', margin: '6rem 0' }}>
        <h2>Vehicle Info Missing</h2>
        <p>Could not fetch vehicle pricing details.</p>
      </div>
    );
  }

  if (successBooking) {
    return (
      <div className="container">
        <div className="form-card glass animate-fade-in" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '1rem 0' }}>Booking Request Received!</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Your booking request has been registered and sent to our admin team for verification. A confirmation email has been dispatched to your email address.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <p style={{ marginBottom: '8px' }}><strong>Booking ID:</strong> <span style={{ color: '#60a5fa' }}>{successBooking.bookingId}</span></p>
            <p style={{ marginBottom: '8px' }}><strong>Vehicle:</strong> {car.brand} {car.name}</p>
            <p style={{ marginBottom: '8px' }}><strong>Pickup:</strong> {new Date(successBooking.pickupDate).toDateString()}</p>
            <p style={{ marginBottom: '8px' }}><strong>Return:</strong> {new Date(successBooking.returnDate).toDateString()}</p>
            <p style={{ marginBottom: '8px' }}><strong>Total Days:</strong> {priceDetails.days} days</p>
            <p style={{ marginBottom: '0' }}><strong>Amount Owed:</strong> <span style={{ color: '#10b981' }}>₹{successBooking.totalAmount}</span></p>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/tracker" className="btn-full" style={{ flex: 1, textDecoration: 'none' }}>
              Track Booking
            </Link>
            <Link to="/cars" className="nav-btn nav-btn-outline" style={{ flex: 1, height: '42px', paddingTop: '10px' }}>
              Book Another Ride
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        
        {/* Booking Form */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Renter Details</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required placeholder="Driver's Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" required placeholder="Primary Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required placeholder="driver@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input type="tel" required placeholder="Secondary Contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhaar Card Number</label>
                <input type="text" required placeholder="12-digit Aadhaar Number" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Driving License Number</label>
                <input type="text" required placeholder="DL Number (e.g. DL-14...)" value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Residential Address (for Security Verification)</label>
              <textarea 
                required 
                placeholder="Enter your complete residential address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                rows="2"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Pickup Date</label>
                <input type="date" required value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Return Date</label>
                <input type="date" required value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Aadhaar Image Document</label>
                <input type="file" accept="image/*" required onChange={(e) => setAadhaarFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label>License Image Document</label>
                <input type="file" accept="image/*" required onChange={(e) => setLicenseFile(e.target.files[0])} />
              </div>
            </div>

            <button type="submit" className="btn-full" style={{ marginTop: '2rem', padding: '14px' }} disabled={submitting}>
              {submitting ? 'Registering Booking...' : 'Submit Booking Request'}
            </button>
          </form>
        </div>

        {/* Pricing Summary Widget */}
        <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Rental Summary
          </h3>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '50px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {car.images && car.images[0] ? (
                <img src={car.images[0].startsWith('http') ? car.images[0] : `${API_BASE_URL}${car.images[0]}`} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} alt="" />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>No Image</span>
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>{car.brand}</span>
              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{car.name}</h4>
            </div>
          </div>

          <table style={{ width: '100%', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>Daily Rate</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#f9fafb', fontWeight: '600' }}>₹{car.pricePerDay}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>Rental Period</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#f9fafb', fontWeight: '600' }}>{priceDetails.days} Days</td>
              </tr>
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Estimated Total:</span>
            <strong style={{ fontSize: '1.8rem', color: '#10b981' }}>₹{priceDetails.total}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
