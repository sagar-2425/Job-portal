const express = require('express');
const { 
  saveJob, 
  unsaveJob, 
  getSavedJobs, 
  checkIfSaved 
} = require('../controllers/savedJobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and seeker role
router.use(authMiddleware);
router.use(roleMiddleware('seeker'));

// Save a job
router.post('/save', saveJob);

// Unsave a job
router.delete('/unsave/:jobId', unsaveJob);

// Get user's saved jobs
router.get('/my', getSavedJobs);

// Check if a job is saved
router.get('/check/:jobId', checkIfSaved);

module.exports = router; 