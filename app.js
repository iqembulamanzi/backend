const express = require('express');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');
const connectDB = require('./config/db');

const app = express();
const PORT = 2000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML

// Routes
app.get('/', (req, res) => {
  console.log('Serving user form on refresh with status 200:', req.method, req.url); // Log page refresh in terminal
  res.status(200).sendFile(path.join(__dirname, 'public/user_form.html'));
});

app.use(userRoutes);

// Catch-all handler for 404 (page not found)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
