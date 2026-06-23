import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Car from './models/Car.js';
import BusinessSettings from './models/BusinessSettings.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await BusinessSettings.deleteMany({});

    console.log('Cleared existing collections.');

    // Seed Super Admin
    const superadmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password123', // Will be hashed by user pre-save hook
      role: 'superadmin',
    });
    console.log('Seeded Super Admin: superadmin@example.com / password123');

    // Seed test customer
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
    });
    console.log('Seeded Customer: john@example.com / password123');

    // Seed Cars
    const cars = [
      {
        name: 'Model S Plaid',
        brand: 'Tesla',
        model: 'Plaid Tri-Motor',
        year: 2026,
        fuelType: 'Electric',
        transmission: 'Automatic',
        pricePerDay: 15000,
        status: 'available',
      },
      {
        name: 'M4 Competition',
        brand: 'BMW',
        model: 'Coupe',
        year: 2025,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        pricePerDay: 12000,
        status: 'available',
      },
      {
        name: 'R8 V10 Spyder',
        brand: 'Audi',
        model: 'Quattro',
        year: 2024,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        pricePerDay: 25000,
        status: 'maintenance', // Starts in maintenance mode to test alert UI
      },
      {
        name: 'Fortuner Legender',
        brand: 'Toyota',
        model: '4x4 Sigma 4',
        year: 2025,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        pricePerDay: 8000,
        status: 'available',
      },
      {
        name: 'Creta N-Line',
        brand: 'Hyundai',
        model: '1.5 T-GDi',
        year: 2025,
        fuelType: 'Petrol',
        transmission: 'Manual',
        pricePerDay: 3500,
        status: 'available',
      },
    ];

    await Car.insertMany(cars);
    console.log('Seeded 5 premium fleet cars.');

    // Seed Business Settings
    await BusinessSettings.create({
      businessName: 'DriveEasy Rentals',
      logoUrl: '',
      phone: '+91 9999999999',
      email: 'support@driveeasy.com',
      address: '123 Main Fleet Hub, Aerocity, New Delhi, India',
      facebook: 'https://facebook.com/driveeasy',
      instagram: 'https://instagram.com/driveeasy',
    });
    console.log('Seeded initial Business Settings.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
