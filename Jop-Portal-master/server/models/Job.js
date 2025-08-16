const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Remote'],
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  tags: [String],
  applicants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  customQuestions: [
    {
      label: { type: String, required: true },
      type: { type: String, enum: ['text', 'textarea', 'select', 'checkbox'], default: 'text' },
      options: [String], // for select/checkbox
      required: { type: Boolean, default: false },
      placeholder: { type: String, default: '' }
    }
  ]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Job', jobSchema); 