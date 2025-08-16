const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// Save a job
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({
      seekerId: req.user.id,
      jobId: jobId
    });

    if (existingSavedJob) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Create saved job
    const savedJob = new SavedJob({
      seekerId: req.user.id,
      jobId: jobId
    });

    await savedJob.save();
    await savedJob.populate('jobId', 'title company location type salaryRange');

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unsave a job
const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOneAndDelete({
      seekerId: req.user.id,
      jobId: jobId
    });

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job removed from saved jobs' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ seekerId: req.user.id })
      .populate('jobId', 'title company location type salaryRange createdAt')
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if a job is saved
const checkIfSaved = async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      seekerId: req.user.id,
      jobId: jobId
    });

    res.json({ isSaved: !!savedJob });
  } catch (error) {
    console.error('Check if saved error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved
}; 