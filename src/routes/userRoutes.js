const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Submit user form
router.post('/submit', userController.submitUser);

// Get all users (protected)
router.get('/users', auth, userController.getUsers);

// Login user
router.post('/login', userController.loginUser);

module.exports = router;