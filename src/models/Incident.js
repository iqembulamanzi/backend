const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reporterPhone: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['manhole_overflow', 'toilet_backup', 'pipe_burst', 'other'], default: 'other' },
  priority: { type: String, enum: ['P0', 'P1', 'P2'], default: 'P2' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'verified'], default: 'open' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  guardianAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  mediaUrls: [{ type: String }],
  sewageLossEstimate: { type: Number, default: 0 }, // in liters
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Temporarily remove geospatial index to avoid validation error
// incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);