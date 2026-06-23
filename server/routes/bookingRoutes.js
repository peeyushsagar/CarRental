import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getDashboardStats,
  getCustomerDirectory,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Admin customer directory route (must be before /:id)
router.get('/admin/customers', protect, authorize('admin', 'superadmin'), getCustomerDirectory);

// Public route for lookup/tracking
router.get('/:id', getBookingById);

// Protected routes
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'drivingLicenseImage', maxCount: 1 },
  ]),
  createBooking
);

router.get('/', protect, getBookings);

// Admin & SuperAdmin routes
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateBookingStatus);
router.get('/stats/dashboard', protect, authorize('admin', 'superadmin'), getDashboardStats);

export default router;
