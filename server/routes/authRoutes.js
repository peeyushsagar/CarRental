import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  createAdmin,
  getAdmins,
  deleteAdmin,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  updateProfile,
  requestAccountDeletion,
  uploadProfilePhoto,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('profileImage'), uploadProfilePhoto);
router.put('/request-delete', protect, requestAccountDeletion);
router.get('/users', protect, authorize('admin', 'superadmin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin', 'superadmin'), updateUserStatus);
router.delete('/users/:id', protect, authorize('admin', 'superadmin'), deleteUser);

// SuperAdmin only routes
router.post('/create-admin', protect, authorize('superadmin'), createAdmin);
router.get('/admins', protect, authorize('superadmin'), getAdmins);
router.delete('/admins/:id', protect, authorize('superadmin'), deleteAdmin);

export default router;
