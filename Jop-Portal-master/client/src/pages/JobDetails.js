import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaCalendarAlt, FaUser, FaArrowLeft, FaShare, FaBookmark, FaRegBookmark, FaEdit, FaCode, FaBriefcase, FaClock } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import { savedJobService } from '../services/savedJobService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'seeker' && job) {
      checkIfSaved();
    }
  }, [job, isAuthenticated, user]);

  const loadJob = async () => {
    try {
      const jobData = await jobService.getJob(id);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await savedJobService.checkIfSaved(job._id);
      setIsSaved(response.isSaved);
    } catch (error) {
      console.error('Error checking if saved:', error);
    }
  };

  const toggleSave = async () => {
    if (!isAuthenticated || user?.role !== 'seeker') {
      toast.error('Please login as a job seeker to save jobs');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await savedJobService.unsaveJob(job._id);
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        await savedJobService.saveJob(job._id);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/apply/${id}` } } });
      return;
    }

    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    navigate(`/apply/${id}`);
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

  const isJobOwner = user && job && user.id === job.recruiterId._id;

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-container">
        <div className="error-state">
          <h2>Job not found</h2>
          <Link to="/jobs" className="back-btn">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      {/* Header */}
      <div className="job-details-header">
        <Link to={user && user.role === 'recruiter' ? '/dashboard/recruiter' : '/jobs'} className="back-btn">
          <FaArrowLeft />
          {user && user.role === 'recruiter' ? 'Back to Dashboard' : 'Back to Jobs'}
        </Link>
      </div>

      <div className="job-details-content">
        {/* Main Job Information */}
        <div className="job-main-section">
          {/* Company and Title */}
          <div className="job-header-card">
            <div className="company-name">{job.company}</div>
            <h1 className="job-title">{job.title}</h1>
            <div className="job-type-badge">{job.type}</div>
          </div>

          {/* Job Details Grid */}
          <div className="job-details-grid">
            <div className="detail-item">
              <FaMapMarkerAlt />
              <span>{job.location}</span>
            </div>
            <div className="detail-item">
              <FaMoneyBillWave />
              <span>${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <FaClock />
              <span>Posted {formatDate(job.createdAt)}</span>
            </div>
            <div className="detail-item">
              <FaBuilding />
              <span>{job.recruiterId?.company || 'Company'}</span>
            </div>
          </div>

          {/* Job Description */}
          <div className="job-section">
            <h3 className="section-title">
              <FaBriefcase />
              Job Description
            </h3>
            <div className="job-description">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="description-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          {job.requirements && job.requirements.includes(',') && (
            <div className="job-section">
              <h3 className="section-title">
                <FaCode />
                Required Skills
              </h3>
              <div className="skills-grid">
                {job.requirements
                  .split(',')
                  .map(skill => skill.trim())
                  .filter(skill => skill.length > 0)
                  .map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {job.tags && job.tags.length > 0 && !job.requirements?.includes(',') && (
            <div className="job-section">
              <h3 className="section-title">
                <FaCode />
                Skills & Tags
              </h3>
              <div className="skills-grid">
                {job.tags.map((tag, index) => (
                  <span key={index} className="skill-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="job-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Job Summary</h3>
            
            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">Position:</span>
                <span className="summary-value">{job.title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Company:</span>
                <span className="summary-value">{job.company}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Location:</span>
                <span className="summary-value">{job.location}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Type:</span>
                <span className="summary-value">{job.type}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Salary:</span>
                <span className="summary-value">
                  ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {isAuthenticated && user.role === 'seeker' ? (
              <div className="action-buttons">
                <button onClick={handleApply} className="apply-btn">
                  Apply Now
                </button>
                <button
                  onClick={toggleSave}
                  disabled={saving}
                  className={`save-btn ${isSaved ? 'saved' : ''}`}
                  title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                >
                  {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                  {isSaved ? ' Saved' : ' Save'}
                </button>
              </div>
            ) : isAuthenticated && user.role === 'recruiter' ? (
              <div className="recruiter-notice">
                <p>Recruiters cannot apply for jobs</p>
                {isJobOwner && (
                  <Link to={`/edit-job/${job._id}`} className="edit-job-btn">
                    <FaEdit />
                    Edit Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="auth-required">
                <button onClick={handleApply} className="apply-btn">
                  Apply Now
                </button>
                <p className="auth-notice">
                  You'll need to sign in to apply
                </p>
              </div>
            )}

            {/* Company Website */}
            {job.recruiterId?.website && (
              <div className="website-section">
                <a
                  href={job.recruiterId.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-btn"
                >
                  Visit Company Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 