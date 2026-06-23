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
    setShowForm(true);
    setMsg('');
    setError('');
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/cars/${carId}`);
      setMsg('Car deleted successfully.');
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting car.');
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
      status,
    };

    try {
      if (editingCar) {
        await axios.put(`${API_BASE_URL}/api/cars/${editingCar._id}`, carData);
        setMsg('Car updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/api/cars`, carData);
        setMsg('New car added successfully.');
      }
      setShowForm(false);
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car record.');
    }
  };

  const handleImageUploadSubmit = async (e, carId) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/cars/${carId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
          📊 Overview
        </NavLink>
        <NavLink to="/admin/cars" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          🚗 Manage Cars
        </NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          📅 Manage Bookings
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          👥 Registered Users
        </NavLink>
        <NavLink to="/admin/history" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          📜 Rental History
        </NavLink>
        {isSuperAdmin && (
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            ⚙️ Business Settings
          </NavLink>
        )}
      </aside>

      {/* Main dashboard content */}
      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage Vehicles</h1>
            <p style={{ color: '#9ca3af' }}>Add, update, or remove fleet cars, and set maintenance status</p>
          </div>
          <button onClick={handleOpenAdd} className="nav-btn nav-btn-primary" style={{ height: '42px' }}>
            ➕ Add New Car
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
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{car.model} ({car.year})</div>
                    </td>
                    <td>
                      {car.fuelType} / {car.transmission}
                    </td>
                    <td style={{ fontWeight: '600', color: '#10b981' }}>
                      ₹{car.pricePerDay}
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
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(car._id)} className="btn-icon btn-danger">
                          🗑️ Delete
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
