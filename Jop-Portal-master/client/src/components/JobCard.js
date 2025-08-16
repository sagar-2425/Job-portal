import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaClock, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { savedJobService } from '../services/savedJobService';
import toast from 'react-hot-toast';
import './JobCard.css';

const JobCard = ({ job, onRequestUnsave, style, index }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'seeker' && job?._id) {
      checkIfSaved();
    }
  }, [job?._id, isAuthenticated, user]);

  const checkIfSaved = async () => {
    try {
      const response = await savedJobService.checkIfSaved(job._id);
      setIsSaved(response.isSaved);
    } catch (error) {
      console.error('Error checking if saved:', error);
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== 'seeker') {
      toast.error('Please login as a job seeker to save jobs');
      return;
    }
    if (isSaved) {
      if (onRequestUnsave) {
        onRequestUnsave(job._id);
      }
    } else {
      await toggleSave();
    }
  };

  const toggleSave = async () => {
    setSaving(true);
    try {
      await savedJobService.saveJob(job._id);
      setIsSaved(true);
      toast.success('Job saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (!job || !job._id) {
    return (
      <div className="job-card">
        <div className="job-card-content">
          <p>Job data not available</p>
        </div>
      </div>
    );
  }

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Salary not specified';
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="job-card" style={style}>
      {/* Main Content */}
      <div className="job-card-content">
        {/* Company Name at Top */}
        <div className="company-name">{job.company || 'Company not specified'}</div>
        
        {/* Job Header */}
        <div className="job-card-header">
          <h3 className="job-title">{job.title || 'Untitled Job'}</h3>
        </div>

        {/* Job Details */}
        <div className="job-details">
          <div className="detail-item">
            <FaMapMarkerAlt />
            <span>{job.location || 'Location not specified'}</span>
          </div>
          <div className="detail-item">
            <FaMoneyBillWave />
            <span>{formatSalary(job.salaryRange?.min, job.salaryRange?.max)}</span>
          </div>
          <div className="detail-item">
            <FaClock />
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </div>

        {/* Job Tags */}
        {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
          <div className="job-tags">
            {job.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
            {job.tags.length > 3 && (
              <span className="tag">+{job.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="job-actions">
        <Link to={`/jobs/${job._id}`} className="action-btn">
          View
        </Link>
        <Link to={`/apply/${job._id}`} className="action-btn">
          Apply
        </Link>
        {isAuthenticated && user?.role === 'seeker' && (
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className={`save-button ${isSaved ? 'saved' : ''}`}
            title={isSaved ? 'Remove from saved jobs' : 'Save job'}
            aria-pressed={isSaved}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard; 