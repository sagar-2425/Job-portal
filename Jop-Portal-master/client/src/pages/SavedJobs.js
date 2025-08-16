import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaArrowLeft, FaBriefcase } from 'react-icons/fa';
import { savedJobService } from '../services/savedJobService';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';
import './SavedJobs.css';

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToRemove, setJobToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await savedJobService.getSavedJobs();
      const validSavedJobs = data.filter(savedJob => savedJob.jobId && savedJob.jobId._id);
      setSavedJobs(validSavedJobs);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  // When user clicks unsave icon, show modal
  const handleUnsaveClick = (jobId) => {
    setJobToRemove(jobId);
    setShowRemoveModal(true);
  };

  // Confirm removal
  const confirmRemove = async () => {
    try {
      await savedJobService.unsaveJob(jobToRemove);
      setSavedJobs(prev => prev.filter(savedJob => savedJob.jobId._id !== jobToRemove));
      toast.success('Job removed from saved jobs');
    } catch (error) {
      toast.error('Failed to remove job from saved jobs');
    } finally {
      setShowRemoveModal(false);
      setJobToRemove(null);
    }
  };

  // Cancel removal
  const cancelRemove = () => {
    setShowRemoveModal(false);
    setJobToRemove(null);
  };

  if (loading) {
    return (
      <div className="saved-jobs-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-container">
        {/* Header */}
        <div className="saved-jobs-header">
          <Link to="/dashboard/seeker" className="back-link">
            <FaArrowLeft />
            Back to Dashboard
          </Link>
          <div className="header-content">
            <div className="header-icon">
              <FaBookmark />
            </div>
            <div className="header-text">
              <h1 className="page-title">My Saved Jobs</h1>
              <p className="page-subtitle">
                {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="saved-jobs-content">
          {savedJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBookmark />
              </div>
              <h2 className="empty-title">No saved jobs yet</h2>
              <p className="empty-description">
                Start exploring jobs and save the ones that interest you. 
                You can save jobs by clicking the bookmark icon on any job card.
              </p>
              <div className="empty-actions">
                <Link to="/jobs" className="browse-jobs-btn">
                  <FaBriefcase />
                  Browse Jobs
                </Link>
                <Link to="/" className="home-btn">
                  Go to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="saved-jobs-grid">
              {savedJobs.map((savedJob) => (
                <div key={savedJob._id} className="saved-job-wrapper">
                  {savedJob.jobId ? (
                    <>
                      <JobCard 
                        job={savedJob.jobId} 
                        onRequestUnsave={handleUnsaveClick}
                      />
                      <div className="saved-date">
                        Saved on {new Date(savedJob.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  ) : (
                    <div className="invalid-job-card">
                      <p>Job data not available</p>
                      <button 
                        onClick={() => handleUnsaveClick(savedJob._id)}
                        className="remove-invalid-btn"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {savedJobs.length > 0 && (
          <div className="saved-jobs-footer">
            <Link to="/jobs" className="browse-more-btn">
              <FaBriefcase />
              Browse More Jobs
            </Link>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remove Saved Job?</h3>
            <p>Are you sure you want to remove this job from your saved jobs?</p>
            <div className="modal-actions">
              <button onClick={confirmRemove} className="btn btn-danger">Remove</button>
              <button onClick={cancelRemove} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedJobs; 