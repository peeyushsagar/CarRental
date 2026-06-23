import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Check if Cloudinary credentials are set (ignoring 'mock' values)
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock' &&
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret_here';

let storage;

if (isCloudinaryConfigured) {
  // Configure Cloudinary configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Setup Cloudinary Storage engine
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Map file types to target folders
      let folder = 'car_rental_uploads';
      if (file.fieldname === 'images' || file.fieldname === 'carImage') {
        folder = 'car_photos';
      } else if (file.fieldname === 'aadhaarImage' || file.fieldname === 'drivingLicenseImage') {
        folder = 'user_documents';
      } else if (file.fieldname === 'profileImage' || file.fieldname === 'profilePhoto') {
        folder = 'profile_photos';
      } else if (file.fieldname === 'logo' || file.fieldname === 'logoImage') {
        folder = 'logo_uploads';
      }

      return {
        folder: folder,
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
      };
    },
  });
  console.log('CLOUDINARY: Storage Engine initialized.');
} else {
  // Fallback storage engine (Local disk storage)
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  console.log('LOCAL STORAGE: Fallback Storage Engine initialized (Cloudinary not configured).');
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
