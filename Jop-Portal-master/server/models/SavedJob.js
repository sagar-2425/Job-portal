const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  seekerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true
  }
}, { 
  timestamps: true 
});

// Ensure one saved job per seeker per job
savedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema); 