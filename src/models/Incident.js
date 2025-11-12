const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reporterPhone: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['manhole_overflow', 'toilet_backup', 'pipe_burst', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['P0', 'P1', 'P2'],
    default: 'P2'
  },
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
  mediaUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['reported', 'verified', 'in_progress', 'resolved'],
    default: 'reported'
  },
  guardianAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sewageLossEstimate: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Enable geospatial queries
incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);