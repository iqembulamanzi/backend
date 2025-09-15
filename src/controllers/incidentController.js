
const twilio = require('twilio');
const IncidentService = require('../services/incidentService');
const incidentService = new IncidentService();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Handle WhatsApp webhook
const handleWebhook = (req, res) => {
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