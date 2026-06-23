import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const BusinessSettingsPage = () => {
  const { settings, updateSettings, uploadLogo } = useSettings();
  const { createAdminAccount } = useAuth();

  // Settings states
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [facebook, setFacebook] = useState(settings.facebook || '');
  const [instagram, setInstagram] = useState(settings.instagram || '');
  
  // File upload state
  const [logoFile, setLogoFile] = useState(null);

  // Create Admin states
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Messages
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
    setSettingsError('');

    const result = await updateSettings({
      businessName,
      phone,
      email,
      address,
      facebook,
      instagram,
    });

    if (result.success) {
      setSettingsMsg('Business settings updated successfully!');
    } else {
      setSettingsError(result.message);
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    setSettingsMsg('');
    setSettingsError('');

    const formData = new FormData();
    formData.append('logo', logoFile);

    const result = await uploadLogo(formData);
    if (result.success) {
      setSettingsMsg('Business logo uploaded and updated successfully!');
      setLogoFile(null);
    } else {
      setSettingsError(result.message);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminMsg('');
    setAdminError('');

    const result = await createAdminAccount(adminName, adminEmail, adminPassword);
    if (result.success) {
      setAdminMsg(`Admin account for ${adminName} created successfully!`);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } else {
      setAdminError(result.message);
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
        <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          Business Settings
        </NavLink>
      </aside>

      {/* Main dashboard content */}
      <main className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* Settings Form */}
        <div>
          <div className="glass" style={{ padding: '2rem', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem' }}>Update Business Profile</h2>
            
            {settingsMsg && <div className="alert alert-success">{settingsMsg}</div>}
            {settingsError && <div className="alert alert-danger">{settingsError}</div>}

            <form onSubmit={handleSettingsSubmit}>
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Helpline Phone</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Office Address</label>
                <textarea rows="3" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', padding: '12px 16px', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem' }}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Facebook URL (Optional)</label>
                  <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Instagram URL (Optional)</label>
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn-full" style={{ marginTop: '1rem', padding: '12px' }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Logo Upload Card */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Upload Brand Logo</h2>
            
            <form onSubmit={handleLogoSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input type="file" required accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
              <button type="submit" className="nav-btn nav-btn-primary" style={{ height: '42px', padding: '0 25px' }} disabled={!logoFile}>
                Upload Logo
              </button>
            </form>
          </div>
        </div>

        {/* Create Admin Form */}
        <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem' }}>Create Admin Account</h2>
          
          {adminMsg && <div className="alert alert-success">{adminMsg}</div>}
          {adminError && <div className="alert alert-danger">{adminError}</div>}

          <form onSubmit={handleCreateAdminSubmit}>
            <div className="form-group">
              <label>Admin Full Name</label>
              <input type="text" required placeholder="e.g. Jane Doe" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" required placeholder="e.g. admin@driveeasy.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" required placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn-full" style={{ marginTop: '1.5rem', padding: '12px' }}>
              Register Admin
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};

export default BusinessSettingsPage;
