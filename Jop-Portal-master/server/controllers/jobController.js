const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all jobs with filters
const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      type, 
      minSalary, 
      maxSalary, 
      tags,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (minSalary || maxSalary) {
      filter.salaryRange = {};
      if (minSalary) filter.salaryRange.$gte = parseInt(minSalary);
      if (maxSalary) filter.salaryRange.$lte = parseInt(maxSalary);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(filter)
      .populate('recruiterId', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalJobs: total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recruiter's jobs
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id })
      .populate('recruiterId', 'name company')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name company website')
      .populate('applicants');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create job (recruiter only)
const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      company, 
      location, 
      jobType, 
      experienceLevel,
      requirements,
      salaryRange, 
      isActive = true,
      customQuestions = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !company || !location || !salaryRange) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Map jobType to the expected enum values
    let type;
    switch (jobType) {
      case 'full-time':
        type = 'Full-time';
        break;
      case 'part-time':
        type = 'Part-time';
        break;
      case 'contract':
      case 'internship':
      case 'freelance':
        type = 'Remote';
        break;
      default:
        type = 'Full-time';
    }

    const job = new Job({
      title,
      description,
      requirements,
      company,
      recruiterId: req.user.id,
      location,
      type,
      salaryRange,
      isActive,
      tags: [experienceLevel, jobType], // Use experience level and job type as tags
      customQuestions
    });

    await job.save();
    await job.populate('recruiterId', 'name company');

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update job (recruiter only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, requirements, company, location, jobType, experienceLevel, salaryRange, isActive, customQuestions } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (requirements !== undefined) updateFields.requirements = requirements;
    if (company) updateFields.company = company;
    if (location) updateFields.location = location;
    if (jobType) {
      // Map jobType to the expected enum values
      let type;
      switch (jobType) {
        case 'full-time':
          type = 'Full-time';
          break;
        case 'part-time':
          type = 'Part-time';
          break;
        case 'contract':
        case 'internship':
        case 'freelance':
          type = 'Remote';
          break;
        default:
          type = 'Full-time';
      }
      updateFields.type = type;
    }
    if (salaryRange) updateFields.salaryRange = salaryRange;
    if (experienceLevel) updateFields.tags = [experienceLevel, jobType];
    if (typeof isActive === 'boolean') updateFields.isActive = isActive;
    if (customQuestions !== undefined) updateFields.customQuestions = customQuestions;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('recruiterId', 'name company');

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job (recruiter only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getRecruiterJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
}; 