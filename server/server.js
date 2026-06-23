import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load Env
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin requests for local static uploads
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api', limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or postman requests (no origin)
    if (!origin) return callback(null, true);
    
    // Check if origin matches exactly or matches domain ignoring protocols/trailing slashes
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      const cleanAllowed = allowed.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return cleanAllowed === cleanOrigin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Static folder for file uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

// Simple Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Car Rental API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
