import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CarsListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (brand) params.brand = brand;
      if (fuelType) params.fuelType = fuelType;
      if (transmission) params.transmission = transmission;

      const { data } = await axios.get(`${API_BASE_URL}/api/cars`, { params });
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [brand, fuelType, transmission]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  // SVG Car placeholder
  const renderCarPlaceholder = () => (
    <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', height: '80%' }}>
      <path d="M20 70 C20 70 35 45 60 40 C85 35 110 25 150 40 C190 55 195 65 195 75 C195 75 180 77 150 77 L50 77 Z" fill="#3b82f6" opacity="0.8" />
      <path d="M70 42 C70 42 85 20 120 20 C155 20 160 42 160 42 Z" fill="#111827" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="55" cy="78" r="14" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
      <circle cx="155" cy="78" r="14" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title">Available Vehicles</h1>

      {/* Filters Bar */}
      <div className="filters-bar glass">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '250px' }}>
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Search Keyword</label>
            <input
              type="text"
              placeholder="Search by name, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="nav-btn nav-btn-primary" style={{ alignSelf: 'flex-end', height: '42px' }}>
            Search
          </button>
        </form>

        <div className="filter-group">
          <label>Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">All Brands</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Tesla">Tesla</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Toyota">Toyota</option>
            <option value="Mercedes">Mercedes</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Fuel Type</label>
          <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            <option value="">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Transmission</label>
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
            <option value="">All Transmissions</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <h3>Fetching vehicles...</h3>
        </div>
      ) : cars.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }} className="glass">
          <p style={{ padding: '3rem', color: '#9ca3af' }}>No vehicles match your search criteria. Try modifying your filters.</p>
        </div>
      ) : (
        <div className="grid-cars">
          {cars.map((car) => (
            <div key={car._id} className="car-card glass">
              <div className="car-image-container">
                {car.images && car.images.length > 0 ? (
                  <img src={car.images[0].startsWith('http') ? car.images[0] : `${API_BASE_URL}${car.images[0]}`} alt={car.name} />
                ) : (
                  renderCarPlaceholder()
                )}
                <span className={`car-badge badge-${car.status}`}>
                  {car.status}
                </span>
              </div>

              <div className="car-details-body">
                <div className="car-title-row">
                  <div>
                    <span className="car-brand">{car.brand}</span>
                    <h3>{car.name}</h3>
                  </div>
                  <div className="car-price">
                    ₹{car.pricePerDay}
                    <span>/day</span>
                  </div>
                </div>

                <div className="car-specs">
                  <div className="spec-item">
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500' }}>Fuel:</span>
                    <span>{car.fuelType}</span>
                  </div>
                  <div className="spec-item">
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500' }}>Transmission:</span>
                    <span>{car.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500' }}>Year:</span>
                    <span>{car.year}</span>
                  </div>
                </div>

                <div className="car-actions">
                  <Link
                    to={`/cars/${car._id}`}
                    className="btn-full"
                    style={{ textDecoration: 'none' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarsListing;
