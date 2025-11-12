const twilio = require('twilio');
const IncidentService = require('../services/incidentService');
const incidentService = new IncidentService();

// Handle WhatsApp webhook
const handleWebhook = (req, res) => {
  // Twilio validation
  // For validation, reconstruct raw body string from parsed req.body (urlencoded format)
  const querystring = require('querystring');
  const rawBodyStr = querystring.stringify(req.body);
  const signature = req.headers['x-twilio-signature'] || req.get('X-Twilio-Signature');
  console.log('Raw signature header:', req.headers['x-twilio-signature']);
  const url = req.originalUrl;
  const fullUrl = req.protocol + '://' + req.get('host') + url;
  console.log('Full URL for validation:', fullUrl);
  const token = process.env.TWILIO_AUTH_TOKEN;
  console.log('Validation params:', { signature: signature ? 'present (' + signature.substring(0,10) + '...)' : 'missing', url, fullUrl, token: token ? 'present' : 'missing', bodyLength: rawBodyStr.length });

  const isValidUrl = twilio.validateRequest(token, signature, url, rawBodyStr);
  const isValidFull = twilio.validateRequest(token, signature, fullUrl, rawBodyStr);

  console.log('Validation with originalUrl:', isValidUrl, 'with fullUrl:', isValidFull);
  let isValid = isValidUrl || isValidFull;
  if (!process.env.TWILIO_AUTH_TOKEN || process.env.NODE_ENV === 'development') {
    isValid = true; // Bypass in development
    console.log('Bypassing Twilio validation in development');
  }
  console.log('Validation result:', isValid);

  // Use parsed req.body directly (from body-parser)
  console.log('Parsed body:', req.body);
  const from = req.body.From;
  const bodyText = req.body.Body || '';
  const mediaUrl = req.body.MediaUrl0 || '';

  // Log raw body for debugging
  console.log('Raw body keys:', Object.keys(req.body));
  console.log('From:', from, 'Body:', bodyText);

  let description = bodyText;
  let lat = null;
  let lng = null;
  if (req.body.MessageType === 'location' && req.body.Latitude && req.body.Longitude) {
    description = 'Location shared';
    lat = parseFloat(req.body.Latitude);
    lng = parseFloat(req.body.Longitude);
    console.log('Location message received: lat', lat, 'lng', lng);
  }
  if (!from || (description === '' && req.body.MessageType !== 'location')) {
    console.error('Invalid message format: missing From or Body');
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Invalid message format. Please try again.');
    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  const phoneNumber = from.replace('whatsapp:', '');
  const validationNote = isValid ? '' : ' (bypassed validation)';
  console.log(`Received WhatsApp message from ${phoneNumber}: ${description}${validationNote}`);

  // Create incident data
  const incidentData = {
    reporterPhone: phoneNumber,
    description: description,
    category: 'other', // To be determined by NLP later
    location: lat && lng ? { type: 'Point', coordinates: [lng, lat] } : { type: 'Point', coordinates: [0, 0] },
    mediaUrls: mediaUrl ? [mediaUrl] : []
  };

  // Create incident
  incidentService.createIncident(incidentData)
    .then(incident => {
      console.log('Incident created:', incident._id);

      // Reply to user
      const responseMessage = `Thank you for your report. We've created an incident with ID: ${incident._id}. Priority: ${incident.priority}. A Guardian will verify soon.${validationNote}`;

      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(responseMessage);

      res.type('text/xml');
      res.send(twiml.toString());
    })
    .catch(err => {
      console.error('Error creating incident:', err);
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('Sorry, there was an error processing your report. Please try again.');
      res.type('text/xml');
      res.send(twiml.toString());
    });
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

module.exports = { handleWebhook, getIncidents, updateIncident };