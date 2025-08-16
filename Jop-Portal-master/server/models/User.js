const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['seeker', 'recruiter', 'admin'], 
    required: true 
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [String],      // only for seekers
  company: String,       // only for recruiters
  website: String,       // only for recruiters
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema); 