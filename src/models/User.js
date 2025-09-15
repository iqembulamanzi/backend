const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  role: { type: String, enum: ['Guardian', 'Manager', 'Admin'], default: 'Guardian' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Users', userSchema);