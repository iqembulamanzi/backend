const User = require('../models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');

class UserService {
  async createUser(userData) {
    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    // Generate incremental userId (e.g., USER001, USER002)
    const latestUser = await User.findOne().sort({ userId: -1 });
    let nextNumber = 1;
    if (latestUser && latestUser.userId) {
      const match = latestUser.userId.match(/USER(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const userId = `USER${nextNumber.toString().padStart(3, '0')}`;

    // Set location from map coordinates or geocode address
    let location = { type: 'Point', coordinates: [0, 0] };
  
    const lat = parseFloat(userData.lat);
    const lng = parseFloat(userData.lng);
  
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      location.coordinates = [lng, lat];
      console.log(`Using map-verified coordinates: [${lng}, ${lat}]`);
    } else if (userData.address) {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            format: 'json',
            q: userData.address,
            limit: 1,
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'SewageGuardianApp/1.0'
          }
        });
  
        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          location.coordinates = [parseFloat(result.lon), parseFloat(result.lat)];
          console.log(`Geocoded address "${userData.address}" to coordinates: [${location.coordinates[0]}, ${location.coordinates[1]}]`);
        } else {
          console.warn(`No geocoding results for address: ${userData.address}`);
        }
      } catch (geoError) {
        console.error(`Geocoding error for address "${userData.address}":`, geoError.message);
      }
    } else {
      throw new Error('Either map coordinates or address is required for location.');
    }

    // Create and save new user
    const newUser = new User({
      userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      location,
      role: userData.role || 'Guardian',
      password: await bcrypt.hash(userData.password, 12)
      // createdAt defaults to Date.now
    });

    const savedUser = await newUser.save();

    // Verify persistence
    const verifiedUser = await User.findById(savedUser._id);
    if (!verifiedUser) {
      throw new Error('Failed to verify saved user.');
    }

    return {
      savedUser,
      verifiedUser,
      role: savedUser.role
    };
  }

  async updateLocation(userId, address) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found.');
      }

      if (!address || address.trim().length === 0) {
        throw new Error('Address is required for update.');
      }

      let location = user.location || { type: 'Point', coordinates: [0, 0] };

      // Geocode address
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            format: 'json',
            q: address,
            limit: 1,
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'SewageGuardianApp/1.0'
          }
        });

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          location.coordinates = [parseFloat(result.lon), parseFloat(result.lat)];
          console.log(`Updated location for user ${user.userId} to: [${location.coordinates[0]}, ${location.coordinates[1]}]`);
        } else {
          console.warn(`No geocoding results for address: ${address}`);
        }
      } catch (geoError) {
        console.error(`Geocoding error for address "${address}":`, geoError.message);
      }

      // Update user
      user.address = address;
      user.location = location;
      const updatedUser = await user.save();

      return updatedUser;
    } catch (err) {
      console.error('Error updating user location:', err.message);
      throw err;
    }
  }
}

module.exports = UserService;