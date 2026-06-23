import BusinessSettings from '../models/BusinessSettings.js';

// @desc    Get Business Settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Business Settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
export const updateSettings = async (req, res) => {
  const { businessName, phone, email, address, facebook, instagram } = req.body;

  try {
    const settings = await BusinessSettings.getSettings();
    
    settings.businessName = businessName || settings.businessName;
    settings.phone = phone || settings.phone;
    settings.email = email || settings.email;
    settings.address = address || settings.address;
    settings.facebook = facebook !== undefined ? facebook : settings.facebook;
    settings.instagram = instagram !== undefined ? instagram : settings.instagram;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Business Logo
// @route   POST /api/settings/logo
// @access  Private/SuperAdmin
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const settings = await BusinessSettings.getSettings();
    const logoUrl = req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    settings.logoUrl = logoUrl;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
