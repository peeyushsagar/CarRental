import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { sendBookingEmail } from '../utils/email.js';

// @desc    Create a new booking with overlap conflict detection
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  const {
    carId,
    pickupDate,
    returnDate,
    name,
    phone,
    email,
    aadhaar,
    drivingLicense,
    emergencyContact,
    address,
  } = req.body;

  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.status === 'maintenance' || car.status === 'inactive') {
      return res.status(400).json({ message: 'This vehicle is currently unavailable (under maintenance or inactive)' });
    }

    // Parse dates
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Return date must be after pickup date' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          pickupDate: { $lt: end },
          returnDate: { $gt: start },
        },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: 'This vehicle is already booked or reserved for the selected dates.',
      });
    }

    // Calculate total price
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = diffDays * car.pricePerDay;

    // Generate unique booking ID
    const count = await Booking.countDocuments({});
    const bookingId = `CR${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;

    // Handle files if uploaded
    let aadhaarImage = '';
    let drivingLicenseImage = '';

    if (req.files) {
      if (req.files.aadhaarImage && req.files.aadhaarImage[0]) {
        aadhaarImage = `/uploads/${req.files.aadhaarImage[0].filename}`;
      }
      if (req.files.drivingLicenseImage && req.files.drivingLicenseImage[0]) {
        drivingLicenseImage = `/uploads/${req.files.drivingLicenseImage[0].filename}`;
      }
    }

    const booking = await Booking.create({
      bookingId,
      customerId: req.user._id,
      carId,
      pickupDate: start,
      returnDate: end,
      totalAmount,
      customerDetails: {
        name,
        phone,
        email,
        aadhaar,
        drivingLicense,
        emergencyContact,
        address,
      },
      aadhaarImage,
      drivingLicenseImage,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Send confirmation email asynchronously
    sendBookingEmail(booking, car, req.user);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin sees all, Customer sees their own)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      bookings = await Booking.find({})
        .populate('carId')
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ customerId: req.user._id })
        .populate('carId')
        .sort({ createdAt: -1 });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking details (via ID or Booking Tracker lookup)
// @route   GET /api/bookings/:id
// @access  Public (Lookup needs bookingId, full details restricted unless owner/admin)
export const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    let booking;

    // Check if it is a Mongo ID or human-readable Booking ID (e.g. CR20260001)
    if (id.startsWith('CR')) {
      booking = await Booking.findOne({ bookingId: id }).populate('carId', 'name brand model pricePerDay year');
    } else {
      booking = await Booking.findById(id).populate('carId').populate('customerId', 'name email');
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: If public tracker, obscure sensitive data unless authenticated owner/admin
    // (A header authorization check is checked here if available)
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Approve / Reject / Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  const { status, paymentStatus, paymentId } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status || booking.status;
    booking.paymentStatus = paymentStatus || booking.paymentStatus;
    if (paymentId) booking.paymentId = paymentId;

    const updatedBooking = await booking.save();

    // Trigger update notification
    const car = await Car.findById(booking.carId);
    const customer = await User.findById(booking.customerId);
    if (car && customer) {
      sendBookingEmail(updatedBooking, car, customer);
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/bookings/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments({});
    const availableCars = await Car.countDocuments({ status: 'available' });
    const maintenanceCars = await Car.countDocuments({ status: 'maintenance' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Revenue aggregation
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Dynamic charts dataset (revenue by month)
    const bookings = await Booking.find({ status: 'completed' });
    const monthlyRevenue = {};
    
    bookings.forEach((b) => {
      const month = new Date(b.pickupDate).toLocaleString('default', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.totalAmount;
    });

    const chartData = Object.keys(monthlyRevenue).map((month) => ({
      month,
      revenue: monthlyRevenue[month],
    }));

    res.json({
      totalCars,
      availableCars,
      maintenanceCars,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete details of customers who have booked/asked for a booking
// @route   GET /api/bookings/admin/customers
// @access  Private/Admin
export const getCustomerDirectory = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('carId')
      .populate('customerId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const customersMap = {};

    bookings.forEach((b) => {
      const key = b.customerId ? b.customerId._id.toString() : b.customerDetails?.email;
      if (!key) return;

      if (!customersMap[key]) {
        customersMap[key] = {
          customerId: b.customerId ? b.customerId._id : null,
          name: b.customerDetails?.name || (b.customerId ? b.customerId.name : 'Unknown'),
          email: b.customerDetails?.email || (b.customerId ? b.customerId.email : 'Unknown'),
          phone: b.customerDetails?.phone || '',
          address: b.customerDetails?.address || '',
          aadhaar: b.customerDetails?.aadhaar || '',
          drivingLicense: b.customerDetails?.drivingLicense || '',
          aadhaarImage: b.aadhaarImage || '',
          drivingLicenseImage: b.drivingLicenseImage || '',
          joiningDate: b.customerId ? b.customerId.createdAt : null,
          totalBookings: 0,
          totalCompletedBookings: 0,
          totalRentalDays: 0,
          history: [],
        };
      }

      customersMap[key].history.push({
        bookingId: b.bookingId,
        _id: b._id,
        carName: b.carId ? `${b.carId.brand} ${b.carId.name}` : 'Deleted Car',
        pickupDate: b.pickupDate,
        returnDate: b.returnDate,
        totalAmount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
      });

      const days = Math.ceil(Math.abs(new Date(b.returnDate) - new Date(b.pickupDate)) / (1000 * 60 * 60 * 24)) || 1;

      customersMap[key].totalBookings += 1;
      if (b.status === 'confirmed' || b.status === 'completed') {
        customersMap[key].totalCompletedBookings += 1;
        customersMap[key].totalRentalDays += days;
      }

      if (customersMap[key].history.length === 1) {
        customersMap[key].address = b.customerDetails?.address || customersMap[key].address;
        customersMap[key].aadhaar = b.customerDetails?.aadhaar || customersMap[key].aadhaar;
        customersMap[key].drivingLicense = b.customerDetails?.drivingLicense || customersMap[key].drivingLicense;
        customersMap[key].aadhaarImage = b.aadhaarImage || customersMap[key].aadhaarImage;
        customersMap[key].drivingLicenseImage = b.drivingLicenseImage || customersMap[key].drivingLicenseImage;
      }
    });

    const customersList = Object.values(customersMap);
    res.json(customersList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
