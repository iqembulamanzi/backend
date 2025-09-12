const express = require('express')
const router = express.Router()

// Health check route (already exists in app.js, but adding here for completeness)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

// Water quality monitoring routes
router.get('/water-quality', (req, res) => {
  res.json({
    message: 'Water quality monitoring endpoint',
    status: 'under development',
  })
})

// Sensor data routes
router.get('/sensors', (req, res) => {
  res.json({
    message: 'Sensor data endpoint',
    status: 'under development',
  })
})

// AI analysis routes
router.get('/ai-analysis', (req, res) => {
  res.json({
    message: 'AI analysis endpoint',
    status: 'under development',
  })
})

// Community reporting routes
router.get('/reports', (req, res) => {
  res.json({
    message: 'Community reports endpoint',
    status: 'under development',
  })
})

// WhatsApp integration routes
router.get('/whatsapp', (req, res) => {
  res.json({
    message: 'WhatsApp integration endpoint',
    status: 'under development',
  })
})

// Catch-all route for undefined API endpoints
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested path ${req.originalUrl} does not exist`,
  })
})

module.exports = router
