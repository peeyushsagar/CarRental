import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add car name'],
    },
    brand: {
      type: String,
      required: [true, 'Please add brand'],
    },
    model: {
      type: String,
      required: [true, 'Please add model'],
    },
    year: {
      type: Number,
      required: [true, 'Please add year'],
    },
    fuelType: {
      type: String,
      required: [true, 'Please add fuel type'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    },
    transmission: {
      type: String,
      required: [true, 'Please add transmission'],
      enum: ['Manual', 'Automatic'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please add price per day'],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance', 'inactive'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);
export default Car;
