import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    businessName: 'DriveEasy Rentals',
    logoUrl: '',
    phone: '+91 9999999999',
    email: 'support@driveeasy.com',
    address: '123 Main Street, New Delhi, India',
    facebook: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);

  const API_URL = `${API_BASE_URL}/api/settings`;

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updatedFields) => {
    try {
      const { data } = await axios.put(API_URL, updatedFields);
      setSettings(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update settings.',
      };
    }
  };

  const uploadLogo = async (formData) => {
    try {
      const { data } = await axios.post(`${API_URL}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSettings(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload logo.',
      };
    }
  };

  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings,
    updateSettings,
    uploadLogo,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
