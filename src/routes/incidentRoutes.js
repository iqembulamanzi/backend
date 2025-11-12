const express = require('express');
const { handleWebhook, getIncidents, updateIncident } = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// WhatsApp webhook for incoming reports
router.post('/whatsapp', handleWebhook);

// Get incidents (protected)
router.get('/', protect, getIncidents);

// Update incident (protected)
router.put('/:id', protect, updateIncident);

module.exports = router;