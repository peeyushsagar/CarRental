import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const ManageCars = () => {
  const { isSuperAdmin } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form toggles & field states
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [pricePerDay, setPricePerDay] = useState('');
  const [status, setStatus] = useState('available');
  const [color, setColor] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Image Upload states
  const [uploadingCarId, setUploadingCarId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCars = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/cars?status=all`);
      setCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setName('');
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear());
    setFuelType('Petrol');
    setTransmission('Manual');
    setPricePerDay('');
    setStatus('available');
    setColor('');
    setDiscount(0);
    setSelectedFiles([]);
    setShowForm(true);
    setMsg('');
    setError('');
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setName(car.name);
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setFuelType(car.fuelType);
    setTransmission(car.transmission);
    setPricePerDay(car.pricePerDay);
    setStatus(car.status);
    setColor(car.color || '');
    setDiscount(car.discount || 0);
    setSelectedFiles([]);
    setShowForm(true);
    setMsg('');
    setError('');
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMsg('Car deleted successfully.');
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting car.');
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${API_BASE_URL}/api/cars/${editingCar._id}/images`, {
        data: { imageUrl },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setEditingCar((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imageUrl),
      }));
      setMsg('Image removed successfully.');
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    const carData = {
      name,
      brand,
      model,
      year: Number(year),
      fuelType,
      transmission,
      pricePerDay: Number(pricePerDay),
      color,
      discount: Number(discount),
      status,
    };

    try {
      let savedCar;
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingCar) {
        const { data } = await axios.put(`${API_BASE_URL}/api/cars/${editingCar._id}`, carData, config);
        savedCar = data;
        setMsg('Car updated successfully.');
      } else {
        const { data } = await axios.post(`${API_BASE_URL}/api/cars`, carData, config);
        savedCar = data;
        setMsg('New car added successfully.');
      }

      // If we have selected files, upload them for this car!
      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('images', selectedFiles[i]);
        }
        await axios.post(`${API_BASE_URL}/api/cars/${savedCar._id}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setShowForm(false);
      setSelectedFiles([]);
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car record.');
    }
  };

  const handleImageUploadSubmit = async (e, carId) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/cars/${carId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMsg('Images uploaded successfully.');
      setSelectedFiles([]);
      setUploadingCarId(null);
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage Vehicles</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Add, update, or remove fleet cars, and set maintenance status</p>
          </div>
          <button onClick={handleOpenAdd} className="nav-btn nav-btn-primary" style={{ height: '42px' }}>
            Add New Car
          </button>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Form container */}
        {showForm && (
          <div className="glass animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              {editingCar ? `Edit Vehicle: ${name}` : 'Register New Vehicle'}
            </h2>

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Car Name</label>
                  <input type="text" required placeholder="e.g. Model S" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" required placeholder="e.g. Tesla" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <input type="text" required placeholder="e.g. Plaid" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" required placeholder="e.g. 2026" value={year} onChange={(e) => setYear(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Day (₹)</label>
                  <input type="number" required placeholder="Daily charge" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Car Color</label>
                  <input type="text" placeholder="e.g. Red, Black, White" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input type="number" min="0" max="100" placeholder="e.g. 10 for 10% off" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
              </div>


              <div className="form-group" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Vehicle Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px',
                    width: '100%',
                    color: 'var(--text-primary)', outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {editingCar ? 'Add new images to this vehicle.' : 'Upload one or more images for this vehicle.'}
                </p>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--accent-light)' }}>
                    Selected for upload: {selectedFiles.length} file(s)
                  </div>
                )}
              </div>

              {editingCar && editingCar.images && editingCar.images.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Existing Photos</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {editingCar.images.map((imgUrl, i) => (
                      <div key={i} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img 
                          src={imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(imgUrl)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            width: '18px',
                            height: '18px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove Image"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', marginTop: '1.5rem' }}>
                <button type="submit" className="nav-btn nav-btn-primary" style={{ padding: '0 25px', height: '42px' }}>
                  {editingCar ? 'Save Changes' : 'Add Vehicle'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="nav-btn nav-btn-outline" style={{ height: '42px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <h3>Fetching vehicles list...</h3>
        ) : (
          <div className="table-card glass">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle Details</th>
                  <th>Fuel/Trans</th>
                  <th>Daily Price</th>
                  <th>Status</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <strong>{car.brand} {car.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{car.model} ({car.year}) | Color: {car.color || 'Unspecified'}</div>
                    </td>
                    <td>
                      {car.fuelType} / {car.transmission}
                    </td>
                    <td style={{ fontWeight: '600', color: '#10b981' }}>
                      {car.discount > 0 ? (
                        <div>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '6px' }}>₹{car.pricePerDay}</span>
                          <span>₹{Math.round(car.pricePerDay * (1 - car.discount / 100))}</span>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{car.discount}% off</span>
                        </div>
                      ) : (
                        <span>₹{car.pricePerDay}</span>
                      )}
                    </td>
                    <td>
                      <span className={`car-badge badge-${car.status}`} style={{ position: 'static' }}>
                        {car.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span>{car.images?.length || 0} upload(s)</span>
                        <button
                          onClick={() => setUploadingCarId(uploadingCarId === car._id ? null : car._id)}
                          className="btn-icon"
                          style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                        >
                          Upload
                        </button>
                      </div>

                      {uploadingCarId === car._id && (
                        <form onSubmit={(e) => handleImageUploadSubmit(e, car._id)} style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            style={{ fontSize: '0.75rem' }}
                          />
                          <button type="submit" className="nav-btn nav-btn-primary" style={{ padding: '2px 8px', fontSize: '0.75rem', height: '24px' }}>
                            Go
                          </button>
                        </form>
                      )}
                    </td>
                    <td>
                      <div className="btn-actions">
                        <button onClick={() => handleOpenEdit(car)} className="btn-icon">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(car._id)} className="btn-icon btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageCars;
