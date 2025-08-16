import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaGlobe, FaCode, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    company: '',
    website: '',
    skills: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || '',
        company: user.company || '',
        website: user.website || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      await updateProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      bio: user.bio || '',
      company: user.company || '',
      website: user.website || '',
      skills: user.skills ? user.skills.join(', ') : ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">
            <div className="loading-message">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-role">{user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}</p>
              <p className="profile-email">{user.email}</p>
            </div>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <FaTimes /> : <FaEdit />}
            </button>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <FaUser className="form-icon" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope className="form-icon" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  <FaMapMarkerAlt className="form-icon" />
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>
            </div>

            {user.role === 'recruiter' && (
              <div className="form-section">
                <h3 className="section-title">Company Information</h3>
                
                <div className="form-group">
                  <label htmlFor="company" className="form-label">
                    <FaBuilding className="form-icon" />
                    Company Name
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="Your company name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website" className="form-label">
                    <FaGlobe className="form-icon" />
                    Company Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}

            {user.role === 'seeker' && (
              <div className="form-section">
                <h3 className="section-title">Skills & Expertise</h3>
                
                <div className="form-group">
                  <label htmlFor="skills" className="form-label">
                    <FaCode className="form-icon" />
                    Skills (comma-separated)
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    value={formData.skills}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                    placeholder="JavaScript, React, Node.js, Python"
                  />
                </div>

                {user.skills && user.skills.length > 0 && (
                  <div className="skills-display">
                    <h4>Current Skills:</h4>
                    <div className="skills-grid">
                      {user.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 