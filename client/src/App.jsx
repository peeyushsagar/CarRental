import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import CarsListing from './pages/CarsListing';
import CarDetails from './pages/CarDetails';
import BookingTracker from './pages/BookingTracker';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Protected Pages
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin / SuperAdmin Protected Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageCars from './pages/Admin/ManageCars';
import ManageBookings from './pages/Admin/ManageBookings';
import BusinessSettingsPage from './pages/Admin/BusinessSettingsPage';
import ManageUsers from './pages/Admin/ManageUsers';
import RentalHistory from './pages/Admin/RentalHistory';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<CarsListing />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/tracker" element={<BookingTracker />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Bookings Routes */}
            <Route
              path="/book/:carId"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'superadmin']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'superadmin']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'superadmin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Management Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cars"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <ManageCars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <ManageBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/history"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <RentalHistory />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin Settings Route */}
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <BusinessSettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
