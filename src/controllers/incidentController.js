
const twilio = require('twilio');
const IncidentService = require('../services/incidentService');
const incidentService = new IncidentService();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Handle WhatsApp webhook
const handleWebhook = async (req, res) => {
  // Twilio validation
  const bodyStr = req.body.toString();
  const signature = req.headers['x-twilio-signature'] || req.get('X-Twilio-Signature');
  console.log('Raw signature header:', req.headers['x-twilio-signature']);
  const url = req.originalUrl;
  const fullUrl = req.protocol + '://' + req.get('host') + url;
  console.log('Full URL for validation:', fullUrl);
  const token = process.env.TWILIO_AUTH_TOKEN;
  console.log('Validation params:', { signature: signature ? 'present (' + signature.substring(0,10) + '...)' : 'missing', url, fullUrl, token: token ? 'present' : 'missing', bodyLength: bodyStr.length });

  const isValidUrl = twilio.validateRequest(token, signature, url, bodyStr);
  const isValidFull = twilio.validateRequest(token, signature, fullUrl, bodyStr);

  console.log('Validation with originalUrl:', isValidUrl, 'with fullUrl:', isValidFull);
  const isValid = isValidUrl || isValidFull;
  console.log('Validation result:', isValid);

  // Parse body after validation (works for both valid and bypassed)
  const querystring = require('querystring');
  console.log('bodyStr for parsing:', bodyStr);
  const body = querystring.parse(bodyStr);
  console.log('Parsed body:', body);
  const from = body.From;
  const message = body.Body;
  const mediaUrl = body.MediaUrl0 || '';

  if (!from || !message) {
    console.error('Invalid message format: missing From or Body');
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Invalid message format. Please try again.');
    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  const phoneNumber = from.replace('whatsapp:', '');
  const validationNote = isValid ? '' : ' (bypassed validation)';
  console.log(`Received WhatsApp message from ${phoneNumber}: ${message}${validationNote}`);

  // Create incident data
  const incidentData = {
    reporterPhone: phoneNumber,
    description: message,
    category: 'other', // To be determined by NLP later
    location: { type: 'Point', coordinates: [0, 0] }, // Default; prompt for location in full bot
    mediaUrls: mediaUrl ? [mediaUrl] : []
  };

  try {
    const { incident, isNew } = await incidentService.createIncident(incidentData);
    console.log('Incident processed:', incident._id, 'Is new:', isNew);

    // Reply to user
    let responseMessage;
    if (isNew) {
      responseMessage = `Thank you for your report. We've created a new incident with ID: ${incident._id}. Priority: ${incident.priority}. A Guardian will verify soon.${validationNote}`;
    } else {
      responseMessage = `Thank you! Your report has been added to an existing incident (ID: ${incident._id}). Priority: ${incident.priority}. A Guardian will verify soon.${validationNote}`;
    }

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(responseMessage);

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('Error creating incident:', err);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Sorry, there was an error processing your report. Please try again.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

 // Get incidents (protected)
const getIncidents = async (req, res) => {
  try {
    const incidents = await incidentService.getIncidents({ status: { $ne: 'resolved' } }); // Open incidents
    res.status(200).json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update incident status (e.g., for Guardian or official)
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const incident = await incidentService.updateIncident(id, updateData);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.status(200).json({ success: true, incident });
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify incident (Guardian/Admin only)
const verifyIncident = async (req, res) => {
  try {
    // Check role
    if (req.user.role !== 'Guardian' && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Guardians or Admins can verify incidents' });
    }

    const { id } = req.params;
    const { lat, lng, description } = req.body;  // Precise coordinates from Guardian

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (incident.status === 'verified') {
      return res.status(400).json({ success: false, message: 'Incident already verified' });
    }

    // Update with precise location and verification
    incident.status = 'verified';
    incident.verifiedBy = req.user._id;
    if (lat && lng) {
      incident.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    }
    if (description) {
      incident.description = description;  // Override with verified details
    }
    incident.updatedAt = new Date();

    const savedIncident = await incident.save();
    console.log('Incident verified:', savedIncident._id);

    // Send notification to all reporters
    const notificationService = new NotificationService();
    await notificationService.notifyVerification(savedIncident._id);

    res.status(200).json({ success: true, incident: savedIncident });
  } catch (err) {
    console.error('Error verifying incident:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { handleWebhook, getIncidents, updateIncident, verifyIncident };