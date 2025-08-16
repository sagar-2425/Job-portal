const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  seekerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  customAnswers: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['Applied', 'Viewed', 'Interview', 'Shortlisted', 'Rejected', 'Hired', 'Reviewed'],
    default: 'Applied'
  }
}, { 
  timestamps: true 
});

// Ensure one application per seeker per job
applicationSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema); 