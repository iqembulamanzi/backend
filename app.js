/**
 * Main Application File
 *
 * Configures Express application with middleware, routes, and WhatsApp handling.
 * Integrates all components for the sewage incident management system.
 */

const express = require('express');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');
const connectDB = require('./config/db');
const { MessagingResponse } = require('twilio').twiml;
const IncidentService = require('./src/services/incidentService');
const ImageAnalysisService = require('./src/services/imageAnalysisService');
const JobCardService = require('./src/services/jobCardService');
const notificationService = new IncidentService().notificationService;
const imageAnalysisService = new ImageAnalysisService();
const jobCardService = new JobCardService();
const Incident = require('./src/models/Incident');
const Team = require('./src/models/Team');
const JobCard = require('./src/models/JobCard');

const app = express();
const PORT = 2000;

// Store pending images waiting for location
const pendingImages = new Map(); // phone -> { description, mediaUrls }

// For Twilio webhook (raw body for signature validation, before other parsers)
app.use('/api/incidents/webhook', express.raw({ type: '*' }));

// Middleware
const cors = require('cors');
app.use(cors({
  origin: 'http://10.249.84.212:5173', // Frontend IP and port
  credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML


// Routes

const incidentRoutes = require('./src/routes/incidentRoutes');
const jobCardRoutes = require('./src/routes/jobCardRoutes');
app.use('/api/incidents', incidentRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use(userRoutes);

// WhatsApp location sharing handler
app.post('/whatsapp', async (req, res) => {
  try {
    console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2)); // Log full payload for debugging

    const body = req.body.Body || '';
    const reporterPhone = req.body.From ? req.body.From.replace('whatsapp:', '') : null;
    const hasLocation = req.body.Latitude && req.body.Longitude;
    const latitude = parseFloat(req.body.Latitude);
    const longitude = parseFloat(req.body.Longitude);
    const numMedia = parseInt(req.body.NumMedia) || 0;
    const mediaUrls = [];
    if (numMedia > 0) {
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = req.body[`MediaUrl${i}`];
        if (mediaUrl) {
          mediaUrls.push(mediaUrl);
        }
      }
    }

    console.log('Parsed - Body:', body, 'Phone:', reporterPhone, 'Has Location:', hasLocation, 'Lat/Lng:', latitude, longitude, 'NumMedia:', numMedia, 'MediaUrls:', mediaUrls);

    if (!reporterPhone) {
      throw new Error('Missing sender phone');
    }

    const incidentService = new IncidentService();
    const notificationService = new NotificationService();

    let twiml;

    // Handle media (images) first
    if (mediaUrls.length > 0) {
      console.log('Processing media for phone:', reporterPhone);
      try {
        // Analyze the first image, passing the description for fallback analysis
        const isRelevant = await imageAnalysisService.analyzeImage(mediaUrls[0], body);
        console.log(`Image relevance check: ${isRelevant}`);
        if (!isRelevant) {
          console.log('Sending rejection message for irrelevant image');
          twiml = new MessagingResponse();
          twiml.message('This picture does not appear to be related to sewage issues. Please send a photo that shows a sewage leak, spill, or plumbing problem.');
          res.type('text/xml').send(twiml.toString());
          return;
        }

        // Image is relevant, use description or default
        const description = body.trim() || 'User sent an image of a sewage issue';

        // Store pending for location
        pendingImages.set(reporterPhone, { description, mediaUrls });
        console.log('Stored pending image for phone:', reporterPhone);
        twiml = new MessagingResponse();
        twiml.message('Thank you for the photo! Please share your location to complete the report.');

      } catch (error) {
        console.error('Error processing media:', error);
        twiml = new MessagingResponse();
        if (error.message && error.message.includes('sewage-related')) {
          twiml.message('Please provide a description that relates to sewage problems (e.g., sewage, sewer, drain, pipe, leak, overflow, etc.).');
        } else {
          twiml.message('Sorry, there was an error processing your image. Please try again.');
        }
      }
      res.type('text/xml').send(twiml.toString());
      return;
    }

    if (hasLocation && !isNaN(latitude) && !isNaN(longitude)) {
      console.log('Processing location share for phone:', reporterPhone);

      // Check if there's a pending image
      const pending = pendingImages.get(reporterPhone);
      if (pending) {
        pendingImages.delete(reporterPhone);
        try {
          // Create incident with pending image and location
          const { incident: savedIncident, isNew } = await incidentService.createIncident({
            description: pending.description,
            reporterPhone,
            category: 'other',
            location: { type: 'Point', coordinates: [longitude, latitude] },
            mediaUrls: pending.mediaUrls
          });
          console.log('Created incident from pending image and location:', savedIncident._id, 'Number:', savedIncident.incidentNumber, 'Is new:', isNew);
          twiml = new MessagingResponse();
          twiml.message(`Thank you! Incident reported (Number: ${savedIncident.incidentNumber}). A maintenance team will attend to it.`);

          // Notify and broadcast
          const lat = latitude;
          const lng = longitude;
          const address = await incidentService.reverseGeocode(lat, lng);
          const reporterMessage = `Thank you for reporting. Your incident (Number: ${savedIncident.incidentNumber}) has been created. Priority: ${savedIncident.priority}. Location: ${address}. A maintenance team will attend to it.`;
          await notificationService.notifyReporters(savedIncident._id, reporterMessage);

          const groupMessage = `New incident reported (Number: ${savedIncident.incidentNumber}): Photo submitted. Priority: ${savedIncident.priority}. Location: ${address}.`;
          await notificationService.broadcastToAllUsers(savedIncident._id, groupMessage);
        } catch (error) {
          console.error('Error creating incident from pending:', error);
          twiml = new MessagingResponse();
          if (error.message && error.message.includes('sewage-related')) {
            twiml.message('Please provide a description that relates to sewage problems (e.g., sewage, sewer, drain, pipe, leak, overflow, etc.).');
          } else {
            twiml.message('Sorry, there was an error processing your location. Please try again.');
          }
        }
      } else {
        // Existing logic for location without pending image
        const openIncident = await incidentService.findOpenIncidentByReporter(reporterPhone);

        if (openIncident) {
          await incidentService.updateIncident(openIncident._id, {
            location: { type: 'Point', coordinates: [longitude, latitude] }
          });
          const updatedIncident = await Incident.findById(openIncident._id);
          console.log('Updated location for existing incident:', openIncident._id, 'Number:', updatedIncident.incidentNumber);
          twiml = new MessagingResponse();
          twiml.message(`Location updated for incident (Number: ${updatedIncident.incidentNumber}). Thank you!`);

          // Notify reporters
          const reporterMessage = `Your incident (Number: ${updatedIncident.incidentNumber}) location has been updated. A maintenance team will attend to it.`;
          await notificationService.notifyReporters(updatedIncident._id, reporterMessage);

          // Broadcast to group
          const lat = latitude;
          const lng = longitude;
          const address = await incidentService.reverseGeocode(lat, lng);
          const groupMessage = `Incident (Number: ${updatedIncident.incidentNumber}) location updated to ${address}.`;
          await notificationService.broadcastToAllUsers(updatedIncident._id, groupMessage);
        } else {
          // Create incident with location if no open one
          const { incident: savedIncident, isNew } = await incidentService.createIncident({
            description: body.trim() || 'User shared location without prior description',
            reporterPhone,
            category: 'other',
            location: { type: 'Point', coordinates: [longitude, latitude] }
          });
          console.log('Created new incident with location for phone:', reporterPhone, 'Number:', savedIncident.incidentNumber);
          twiml = new MessagingResponse();
          twiml.message(`Thanks for sharing your location! ${isNew ? 'An incident has been created (Number: ${savedIncident.incidentNumber}).' : 'Added to existing incident (Number: ${savedIncident.incidentNumber}).'} Please send a description for more details.`);

          // Notify and broadcast for new with location
          const lat = latitude;
          const lng = longitude;
          const address = await incidentService.reverseGeocode(lat, lng);
          const reporterMessage = `Thank you for reporting. Your incident (Number: ${savedIncident.incidentNumber}) has been created. Priority: P2. Location: ${address}. A maintenance team will attend to it.`;
          await notificationService.notifyReporters(savedIncident._id, reporterMessage);

          const groupMessage = `New incident reported (Number: ${savedIncident.incidentNumber}): User shared location. Priority: P2. Location: ${address}.`;
          await notificationService.broadcastToAllUsers(savedIncident._id, groupMessage);
        }
      }
    } else if (body.trim()) {
      console.log('Processing text message for phone:', reporterPhone);
      const { incident: savedIncident, isNew } = await incidentService.createIncident({
        description: body.trim(),
        reporterPhone,
        category: 'other',
        location: { type: 'Point', coordinates: [0, 0] }
      });
      console.log('Incident created:', savedIncident._id, 'Number:', savedIncident.incidentNumber, 'Is new:', isNew);
      twiml = new MessagingResponse();
      twiml.message(isNew ? `Incident reported and saved (Number: ${savedIncident.incidentNumber})! To add your location, tap the attachment icon and select "Location".` : `Your report added to existing incident (Number: ${savedIncident.incidentNumber})! To add location, tap the attachment icon.`);
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
