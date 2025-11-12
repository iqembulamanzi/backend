const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Submit user form
router.post('/submit', userController.submitUser);

// Get all users
router.get('/users', userController.getUsers);

// Login user
router.post('/login', userController.loginUser);

module.exports = router;