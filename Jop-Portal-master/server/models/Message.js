const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Message', messageSchema); 