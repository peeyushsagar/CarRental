import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: 'DriveEasy Rentals',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '+91 9999999999',
    },
    email: {
      type: String,
      default: 'support@driveeasy.com',
    },
    address: {
      type: String,
      default: '123 Main Street, New Delhi, India',
    },
    facebook: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Statics to get the singleton settings document
businessSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);
export default BusinessSettings;
