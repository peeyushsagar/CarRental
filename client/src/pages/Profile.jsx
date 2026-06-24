import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const { user, updateLocalUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile Photo Upload States
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Deletion Request States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  if (!user) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h3>Please log in to view your profile.</h3>
      </div>
    );
  }

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('profileImage', photoFile);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/profile/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateLocalUser({ profileImage: data.profileImage });
      setSuccessMsg('Profile photo updated successfully!');
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsUpdating(true);

    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        phone,
      });
      updateLocalUser({ phone: data.phone });
      setSuccessMsg('Mobile number updated successfully!');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Failed to update mobile number.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestDeletion = async () => {
    setDeleteError('');
    if (confirmText !== 'DELETE') {
      return setDeleteError('Please type "DELETE" exactly to confirm.');
    }

    try {
      await axios.put(`${API_BASE_URL}/api/auth/request-delete`);
      updateLocalUser({ deletionRequested: true });
      setDeleteSuccess('Account deletion request submitted. An administrator will review it.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      setDeleteError(error.response?.data?.message || 'Failed to request account deletion.');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '650px', padding: '2rem 1rem' }}>
      <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your mobile number and account status</p>

      {/* Account Info Card */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '1.5rem' }}>
          <div>
            {user.profileImage ? (
              <img 
                src={user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}${user.profileImage}`} 
                alt="profile" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} 
              />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>{user.name}</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            <span className="car-badge badge-available" style={{ display: 'inline-block', position: 'static', marginLeft: '10px', textTransform: 'uppercase', fontSize: '0.75rem', padding: '2px 8px' }}>
              {user.role}
            </span>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

        {/* Upload Profile Photo */}
        <form onSubmit={handleUploadPhoto} style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Profile Photo</h3>
          {successMsg && <div className="alert alert-success" style={{ padding: '10px 15px', marginBottom: '1rem' }}>{successMsg}</div>}
          {errorMsg && <div className="alert alert-danger" style={{ padding: '10px 15px', marginBottom: '1rem' }}>{errorMsg}</div>}

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)' }}
            />
            {photoFile && (
              <button type="submit" className="nav-btn nav-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isUploadingPhoto}>
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
          </div>
        </form>

        {/* Change Mobile Form */}
        <form onSubmit={handleUpdatePhone}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Contact Information</h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="profilePhone">Mobile Number</label>
            <input
              type="tel"
              id="profilePhone"
              required
              placeholder="Enter new mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          <button type="submit" className="btn-full" style={{ padding: '10px' }} disabled={isUpdating}>
            {isUpdating ? 'Saving Changes...' : 'Update Mobile Number'}
          </button>
        </form>
      </div>

      {/* Account Deletion Section */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid #ef444433', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.5rem' }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Once you request deletion of your account, you will lose access to all your bookings, settings, and credentials permanently.
        </p>

        {deleteSuccess && <div className="alert alert-success" style={{ padding: '10px 15px', marginBottom: '1rem' }}>{deleteSuccess}</div>}

        {user.deletionRequested ? (
          <div className="alert alert-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '12px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <strong>Deletion Request Pending Approval</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '2px', color: '#fcd34d' }}>An administrator is reviewing your request. Please contact support if you wish to cancel this.</div>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            className="btn-full" 
            onClick={() => setShowDeleteModal(true)}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            Request Account Deletion
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '450px', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ef4444', marginBottom: '1rem' }}>Confirm Account Deletion Request</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you absolutely sure? This will send a formal request to the system administrators to delete your profile permanently. 
              To proceed, please type <strong style={{ color: 'var(--text-primary)' }}>DELETE</strong> below.
            </p>

            {deleteError && <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '1rem' }}>{deleteError}</div>}

            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', marginBottom: '1.5rem' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-full" onClick={() => setShowDeleteModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', flex: 1 }}>
                Cancel
              </button>
              <button className="btn-full" onClick={handleRequestDeletion} style={{ background: '#ef4444', color: '#fff', flex: 1 }}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
