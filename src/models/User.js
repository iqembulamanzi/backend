const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  role: { type: String, enum: ['Guardian', 'Manager', 'Admin'], default: 'Guardian' },
  password: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Enable geospatial queries for guardians
userSchema.index({ location: '2dsphere' });

// Index for reporterPhone
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);