const User = require('../models/User');

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, location, bio, skills, company, website } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (location) updateFields.location = location;
    if (bio) updateFields.bio = bio;
    if (req.user.role === 'seeker' && skills) updateFields.skills = skills;
    if (req.user.role === 'recruiter') {
      if (company) updateFields.company = company;
      if (website) updateFields.website = website;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (for chat header)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMe,
  updateProfile,
  getUserById
}; 