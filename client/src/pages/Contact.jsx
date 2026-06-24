import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title">Contact Support</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', marginTop: '2rem' }}>
        
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0.8rem 0 0.4rem 0', fontWeight: '700' }}>Office Location</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{settings.address}</p>
          </div>

          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0.8rem 0 0.4rem 0', fontWeight: '700' }}>Call Us</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{settings.phone}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mon-Sun: 24 Hours Availability</p>
          </div>

          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0.8rem 0 0.4rem 0', fontWeight: '700' }}>Write to Us</h3>
            <p style={{ color: 'var(--accent-light)', fontSize: '0.95rem', fontWeight: '600' }}>{settings.email}</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Send Us a Message</h2>
          
          {submitted && (
            <div className="alert alert-success">
              Thank you! Your message has been received. Our team will contact you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Message Details</label>
              <textarea rows="5" required placeholder="Describe your query..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', padding: '12px 16px', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" className="btn-full" style={{ marginTop: '1.5rem', padding: '14px' }}>
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
