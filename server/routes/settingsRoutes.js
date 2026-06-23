import express from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('superadmin'), updateSettings);
router.post('/logo', protect, authorize('superadmin'), upload.single('logo'), uploadLogo);

export default router;
