const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const auth = require('../middleware/auth');

// WhatsApp webhook (public, no auth)
router.post('/webhook', incidentController.handleWebhook);

// Get incidents (protected)
router.get('/', auth, incidentController.getIncidents);

// Update incident (protected)
router.put('/:id', auth, incidentController.updateIncident);

module.exports = router;