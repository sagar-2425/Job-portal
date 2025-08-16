const express = require('express');
const { 
  getJobs, 
  getRecruiterJobs,
  getJob, 
  createJob, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes (recruiter only)
router.get('/recruiter/my-jobs', authMiddleware, roleMiddleware('recruiter'), getRecruiterJobs);
router.post('/', authMiddleware, roleMiddleware('recruiter'), createJob);
router.put('/:id', authMiddleware, roleMiddleware('recruiter'), updateJob);
router.delete('/:id', authMiddleware, roleMiddleware('recruiter'), deleteJob);

module.exports = router; 