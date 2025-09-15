const express = require('express');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');
const connectDB = require('./config/db');
const { MessagingResponse } = require('twilio').twiml;
const IncidentService = require('./src/services/incidentService');

const app = express();
const PORT = 2000;

// For Twilio webhook (raw body for signature validation, before other parsers)
app.use('/api/incidents/webhook', express.raw({ type: '*' }));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML


// Routes
app.get('/', (req, res) => {
  console.log('Serving user form on refresh with status 200:', req.method, req.url); // Log page refresh in terminal
  res.status(200).sendFile(path.join(__dirname, 'public/user_form.html'));
});

const incidentRoutes = require('./src/routes/incidentRoutes');
app.use('/api/incidents', incidentRoutes);
app.use(userRoutes);

app.post('/whatsapp', async (req, res) => {
  try {
    console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2)); // Log full payload for debugging

    const body = req.body.Body || '';
    const reporterPhone = req.body.From ? req.body.From.replace('whatsapp:', '') : null;
    const hasLocation = req.body.Latitude && req.body.Longitude;
    const latitude = parseFloat(req.body.Latitude);
    const longitude = parseFloat(req.body.Longitude);

    console.log('Parsed - Body:', body, 'Phone:', reporterPhone, 'Has Location:', hasLocation, 'Lat/Lng:', latitude, longitude);

    if (!reporterPhone) {
      throw new Error('Missing sender phone');
    }

    const incidentService = new IncidentService();

    let twiml;

    if (hasLocation && !isNaN(latitude) && !isNaN(longitude)) {
      console.log('Processing location share for phone:', reporterPhone);
      const openIncidents = await incidentService.getIncidents({
        reporterPhone,
        status: 'open'
      });
      
      if (openIncidents.length > 0) {
        const latestIncident = openIncidents[0]; // Already sorted by createdAt: -1
        await incidentService.updateIncident(latestIncident._id, {
          location: { type: 'Point', coordinates: [longitude, latitude] }
        });
        console.log('Updated location for existing incident:', latestIncident._id);
        twiml = new MessagingResponse();
        twiml.message('Location updated for your recent incident report!');
      } else {
        // Create incident with location if no open one
        await incidentService.createIncident({
          description: body.trim() || 'User shared location without prior description',
          reporterPhone,
          category: 'other',
          location: { type: 'Point', coordinates: [longitude, latitude] }
        });
        console.log('Created new incident with location for phone:', reporterPhone);
        twiml = new MessagingResponse();
        twiml.message('Thanks for sharing your location! An incident has been created. Please send a description for more details.');
      }
    } else if (body.trim()) {
      console.log('Processing text message for phone:', reporterPhone);
      await incidentService.createIncident({
        description: body.trim(),
        reporterPhone,
        category: 'other',
        location: { type: 'Point', coordinates: [0, 0] }
      });
      twiml = new MessagingResponse();
      twiml.message('Incident reported and saved! To add your location, tap the attachment icon and select "Location".');
    } else {
      twiml = new MessagingResponse();
      twiml.message('Hello! To report an incident, send a description of the problem. You can also share your location anytime.');
    }

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('Error processing WhatsApp incident:', error);

    const twiml = new MessagingResponse();
    twiml.message('Sorry, there was an error processing your message. Please try again.');

    res.type('text/xml').send(twiml.toString());
  }
});

// Catch-all handler for 404 (page not found)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
