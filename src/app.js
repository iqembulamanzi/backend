const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
})
app.use(limiter)

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Static files
app.use('/uploads', express.static('uploads'))
app.use('/admin', express.static(path.join(__dirname, '../public/admin')))
app.use(express.static('public')) // Serve static files from public directory

// Routes
app.use('/api', require('./routes'))

// Admin dashboard route - explicitly serve index.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'))
})

// Admin dashboard route - let static middleware handle this
// app.get('/admin', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/admin/index.html'))
// })

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Water Guardian Backend API',
    version: '1.0.0',
    description: 'AI-Supported Water Guardian Backend System',
    endpoints: {
      health: '/health',
      api: '/api',
      admin: '/admin',
      docs: '/api/docs',
    },
    status: 'running',
  })
})

// Favicon handler
app.get('/favicon.ico', (req, res) => {
  res.status(204).end() // No content response for favicon
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handling middleware
app.use(require('./middleware/errorHandler'))

module.exports = app
