const express = require('express');
const { 
  applyForJob, 
  getJobApplications, 
  getMyApplications, 
  updateApplicationStatus, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Apply for job (seeker only)
router.post('/apply', roleMiddleware('seeker'), applyForJob);

// Get my applications (seeker only)
router.get('/my', roleMiddleware('seeker'), getMyApplications);

// Get applications for a job (recruiter only)
router.get('/job/:jobId', roleMiddleware('recruiter'), getJobApplications);

// Update application status (recruiter only)
router.put('/status/:id', roleMiddleware('recruiter'), updateApplicationStatus);

// Update application (seeker only)
router.put('/:id', roleMiddleware('seeker'), updateApplication);

// Delete application (seeker only)
router.delete('/:id', roleMiddleware('seeker'), deleteApplication);

module.exports = router; 