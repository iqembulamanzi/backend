const express = require('express');
const JobCardController = require('../controllers/jobCardController');
const auth = require('../middleware/auth');

const router = express.Router();
const jobCardController = new JobCardController();

// All routes require authentication
router.use((req, res, next) => {
  auth(req, res, next);
});

// Allocate job card to team
router.post('/allocate', jobCardController.allocateJobCard);

// Get job cards for a specific team
router.get('/team/:teamId', jobCardController.getJobCardsForTeam);

// Update job card status
router.put('/:id/status', jobCardController.updateJobCardStatus);

// Get job card by ID
router.get('/:id', jobCardController.getJobCardById);

// Get all job cards with optional filters
router.get('/', jobCardController.getAllJobCards);

module.exports = router;