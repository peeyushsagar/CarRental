import Car from '../models/Car.js';

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  const { brand, fuelType, transmission, status, search } = req.query;

  try {
    const query = {};

    // Filter out inactive cars for public users (unless admin status query is specifically passed)
    if (!status) {
      query.status = { $ne: 'inactive' };
    } else {
      query.status = status;
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single car details
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
export const createCar = async (req, res) => {
  const { name, brand, model, year, fuelType, transmission, pricePerDay, color } = req.body;

  try {
    const car = await Car.create({
      name,
      brand,
      model,
      year,
      fuelType,
      transmission,
      pricePerDay,
      color: color || 'Unspecified',
      status: 'available',
    });

    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update car details
// @route   PUT /api/cars/:id
// @access  Private/Admin
export const updateCar = async (req, res) => {
  const { name, brand, model, year, fuelType, transmission, pricePerDay, color, status } = req.body;

  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      car.name = name || car.name;
      car.brand = brand || car.brand;
      car.model = model || car.model;
      car.year = year || car.year;
      car.fuelType = fuelType || car.fuelType;
      car.transmission = transmission || car.transmission;
      car.pricePerDay = pricePerDay || car.pricePerDay;
      car.color = color !== undefined ? color : car.color;
      car.status = status || car.status;

      const updatedCar = await car.save();
      res.json(updatedCar);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      await Car.deleteOne({ _id: req.params.id });
      res.json({ message: 'Car removed successfully' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Car Images
// @route   POST /api/cars/:id/images
// @access  Private/Admin
export const uploadCarImages = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload files' });
    }

    const imageUrls = req.files.map((file) => file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    car.images.push(...imageUrls);

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a car image
// @route   DELETE /api/cars/:id/images
// @access  Private/Admin
export const deleteCarImage = async (req, res) => {
  const { imageUrl } = req.body;

  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car.images = car.images.filter((img) => img !== imageUrl);

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

