const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, resumeUrl, coverLetter, customAnswers } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      seekerId: req.user.id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Use user info if not provided
    const user = req.user;
    const applicantName = name || user.name;
    const applicantEmail = email || user.email;

    // Create application
    const application = new Application({
      seekerId: req.user.id,
      jobId: jobId,
      name: applicantName,
      email: applicantEmail,
      resumeUrl,
      coverLetter,
      customAnswers: customAnswers || {}
    });

    await application.save();

    // Add application to job's applicants array
    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: application._id }
    });

    await application.populate('seekerId', 'name email');
    await application.populate('jobId', 'title company');

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get applications for a specific job (recruiter only)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job belongs to the recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId })
      .populate('seekerId', 'name email location skills bio')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's applications (seeker only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location type salaryRange recruiterId',
        populate: { path: 'recruiterId', select: 'name _id' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application status (recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id)
      .populate('jobId', 'recruiterId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if job belongs to the recruiter
    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    await application.populate('seekerId', 'name email');
    await application.populate('jobId', 'title company');

    res.json(application);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application (seeker only)
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, resumeUrl, coverLetter, customAnswers } = req.body;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Only the owner (seeker) can update
    if (application.seekerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.name = name;
    application.email = email;
    application.resumeUrl = resumeUrl;
    application.coverLetter = coverLetter;
    application.customAnswers = customAnswers;
    await application.save();
    await application.populate('jobId', 'title company');
    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete application (seeker only)
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Only the owner (seeker) can delete
    if (application.seekerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Remove from job's applicants array
    await Job.findByIdAndUpdate(application.jobId, { $pull: { applicants: application._id } });
    await application.deleteOne();
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  updateApplication,
  deleteApplication
}; 