import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImages,
} from '../controllers/carController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCars);
router.get('/:id', getCarById);

// Admin / SuperAdmin protected routes
router.post('/', protect, authorize('admin', 'superadmin'), createCar);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateCar);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteCar);
router.post(
  '/:id/images',
  protect,
  authorize('admin', 'superadmin'),
  upload.array('images', 5),
  uploadCarImages
);

export default router;
