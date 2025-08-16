import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaChartBar, FaUserTie, FaClock, FaCheckCircle, FaDownload, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './DashboardRecruiter.css';
import ChatModal from '../components/ChatModal';

const DashboardRecruiter = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatApplicant, setChatApplicant] = useState(null);
  const [chatJobId, setChatJobId] = useState(null);
  const [showWaitedList, setShowWaitedList] = useState(false);
  const [waitedApplications, setWaitedApplications] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  // Helper to collect all reviewed applications
  const getAllReviewedApplications = (jobs) => {
    let reviewed = [];
    jobs.forEach(job => {
      (job.applications || []).forEach(app => {
        if (app.status === 'Reviewed') {
          reviewed.push({ ...app, jobTitle: job.title });
        }
      });
    });
    return reviewed;
  };

  const loadJobs = async () => {
    try {
      // Get recruiter's jobs using the new endpoint
      const response = await jobService.getRecruiterJobs();
      // For each job, fetch applications and add applicantCount and applications array
      const jobsWithApplicants = await Promise.all(response.jobs.map(async (job) => {
        try {
          const applications = await applicationService.getJobApplications(job._id);
          return { ...job, applicantCount: applications.length, applications };
        } catch (error) {
          return { ...job, applicantCount: 0, applications: [] };
        }
      }));
      setJobs(jobsWithApplicants);
      // Calculate stats
      const statsData = {
        totalJobs: jobsWithApplicants.length,
        activeJobs: jobsWithApplicants.filter(job => job.isActive).length,
        totalApplications: jobsWithApplicants.reduce((sum, job) => sum + (job.applicantCount || 0), 0),
        // Count all applications that are not 'Reviewed'
        pendingApplications: jobsWithApplicants.reduce((sum, job) => {
          const jobApplications = job.applications || [];
          return sum + jobApplications.filter(app => app.status !== 'Reviewed').length;
        }, 0)
      };
      setStats(statsData);
      setWaitedApplications(getAllReviewedApplications(jobsWithApplicants));
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = (jobId) => {
    setJobToDelete(jobId);
    setDeleteInput('');
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    if (deleteInput !== 'delete' || !jobToDelete) return;
    try {
      await jobService.deleteJob(jobToDelete);
      toast.success('Job deleted successfully');
      setShowDeleteModal(false);
      setJobToDelete(null);
      loadJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const loadJobApplications = async (jobId, jobTitle) => {
    setApplicationsLoading(true);
    setSelectedJob({ id: jobId, title: jobTitle });
    
    try {
      const applicationsData = await applicationService.getJobApplications(jobId);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const closeApplications = () => {
    setSelectedJob(null);
    setApplications([]);
  };

  // Handler to open chat modal
  const handleContactApplicant = (applicant, jobId) => {
    setChatApplicant(applicant);
    setChatJobId(jobId);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showWaitedList) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Waited List (Reviewed Applications)</h1>
            <button className="post-job-btn" onClick={() => setShowWaitedList(false)}>
              Back to Dashboard
            </button>
          </div>
          <div className="applications-list">
            {waitedApplications.length === 0 ? (
              <div className="applications-empty">
                <p>No reviewed applications found.</p>
              </div>
            ) : (
              waitedApplications.map((app, idx) => (
                <div key={app._id || idx} className="application-item modern-app-card">
                  <div className="application-header">
                    <div className="applicant-info">
                      <h3 className="applicant-name">{app.name || 'Unknown Applicant'}</h3>
                      <p className="applicant-email">
                        <FaEnvelope />
                        {app.email || 'No email provided'}
                      </p>
                    </div>
                    <div className="application-meta">
                      <span className="application-status badge reviewed">Reviewed</span>
                      <span className="application-date">
                        <FaCalendar />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="application-content">
                    <div className="application-section">
                      <h4 className="section-subtitle">Job Title</h4>
                      <div>{app.jobTitle}</div>
                    </div>
                    <div className="application-section">
                      <h4 className="section-subtitle">Resume</h4>
                      <div className="resume-section">
                        {app.resumeUrl ? (
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link resume-download-btn">
                            <FaDownload style={{ marginRight: 6 }} />
                            View Resume
                          </a>
                        ) : (
                          <span>No resume provided</span>
                        )}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <div className="application-section">
                        <h4 className="section-subtitle">Cover Letter</h4>
                        <div className="cover-letter">
                          {app.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Recruiter Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user.name}!</p>
          </div>
          <div className="header-actions">
            <Link to="/job-form" className="post-job-btn">
              <FaPlus />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalJobs}</div>
              <div className="stat-label">Total Jobs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeJobs}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon applications">
              <FaUserTie />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalApplications}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingApplications}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
         <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowWaitedList(true)}>
           <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)' }}>
             <FaEye />
           </div>
           <div className="stat-content">
             <div className="stat-number">{waitedApplications.length}</div>
             <div className="stat-label">Waited List</div>
           </div>
         </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/jobs" className="action-btn">
              <FaBriefcase />
              <span>Browse All Jobs</span>
            </Link>
            <Link to="/profile" className="action-btn">
              <FaUsers />
              <span>Update Profile</span>
            </Link>
            <Link to="/job-form" className="action-btn primary">
              <FaPlus />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {/* My Job Postings */}
        <div className="jobs-card">
          <div className="jobs-header">
            <h2 className="section-title">My Job Postings</h2>
            <Link to="/job-form" className="post-job-btn-small">
              <FaPlus />
              Post New Job
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBriefcase />
              </div>
              <h3 className="empty-title">No job postings yet</h3>
              <p className="empty-description">Start posting jobs to find the perfect candidates</p>
              <Link to="/job-form" className="empty-action-btn">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job._id} className="job-item">
                  <div className="job-content">
                    <div className="job-header">
                      <h3 className="job-title">
                        <Link to={`/jobs/${job._id}`}>
                          {job.title}
                        </Link>
                      </h3>
                      <span className={`job-status ${job.isActive ? 'active' : 'inactive'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="job-details">
                      <p className="job-company">{job.company}</p>
                      <p className="job-location">{job.location}</p>
                    </div>
                    
                    <div className="job-footer">
                      <span className="job-salary">
                        ${job.salaryRange?.min?.toLocaleString() || '0'} - ${job.salaryRange?.max?.toLocaleString() || '0'}
                      </span>
                      <span className="job-applicants">
                        {job.applicantCount || 0} applicant{job.applicantCount === 1 ? '' : 's'}
                      </span>
                      <div className="job-actions">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="action-link view"
                        >
                          <FaEye />
                          View
                        </Link>
                        <Link
                          to={`/job/${job._id}/applications`}
                          className="action-link applications"
                          disabled={!job.applicantCount}
                        >
                          <FaUsers />
                          Applications ({job.applicantCount || 0})
                        </Link>
                        <Link
                          to={`/edit-job/${job._id}`}
                          className="action-link edit"
                        >
                          <FaEdit />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="action-link delete"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications Section */}
        {selectedJob && (
          <div className="applications-card">
            <div className="applications-header">
              <h2 className="section-title">
                Applications for: {selectedJob.title}
              </h2>
              <button onClick={closeApplications} className="close-btn">
                ×
              </button>
            </div>

            {applicationsLoading ? (
              <div className="applications-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading applications...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="applications-empty">
                <p>No applications received for this job yet.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((application) => (
                  <div key={application._id} className="application-item">
                    <div className="application-header">
                      <div className="applicant-info">
                        <h3 className="applicant-name">{application.applicantId?.name || 'Unknown Applicant'}</h3>
                        <p className="applicant-email">
                          <FaEnvelope />
                          {application.applicantId?.email || 'No email provided'}
                        </p>
                        {application.applicantId?.phone && (
                          <p className="applicant-phone">
                            <FaPhone />
                            {application.applicantId.phone}
                          </p>
                        )}
                      </div>
                      <div className="application-meta">
                        <span className={`application-status ${application.status?.toLowerCase()}`}>
                          {application.status || 'Applied'}
                        </span>
                        <span className="application-date">
                          <FaCalendar />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="application-content">
                      {application.coverLetter && (
                        <div className="application-section">
                          <h4 className="section-subtitle">Cover Letter</h4>
                          <div className="cover-letter">
                            {application.coverLetter}
                          </div>
                        </div>
                      )}

                      {application.applicantId?.skills && application.applicantId.skills.length > 0 && (
                        <div className="application-section">
                          <h4 className="section-subtitle">Skills</h4>
                          <div className="skills-list">
                            {application.applicantId.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {application.applicantId?.experience && (
                        <div className="application-section">
                          <h4 className="section-subtitle">Experience</h4>
                          <div className="experience">
                            {application.applicantId.experience}
                          </div>
                        </div>
                      )}

                      {application.applicantId?.education && (
                        <div className="application-section">
                          <h4 className="section-subtitle">Education</h4>
                          <div className="education">
                            {application.applicantId.education}
                          </div>
                        </div>
                      )}

                      {application.resume && (
                        <div className="application-section">
                          <h4 className="section-subtitle">Resume</h4>
                          <div className="resume-section">
                            <p className="resume-text">{application.resume}</p>
                            {application.resumeFile && (
                              <a
                                href={application.resumeFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resume-download-btn"
                              >
                                <FaDownload />
                                Download Resume
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="application-actions">
                      <button
                        className="action-btn primary"
                        onClick={() => handleContactApplicant(application.seekerId || application.applicantId, selectedJob.id)}
                      >
                        <FaEnvelope />
                        Contact Applicant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3 className="modal-title">Confirm Job Deletion</h3>
              <p className="modal-message">
                This action <b>cannot be undone</b>.<br />
                Please type <b>delete</b> to confirm you want to delete this job.
              </p>
              <input
                type="text"
                className="modal-input"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="Type 'delete' to confirm"
                autoFocus
              />
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn delete"
                  onClick={confirmDeleteJob}
                  disabled={deleteInput !== 'delete'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUser={user}
        otherUser={chatApplicant}
        jobId={chatJobId}
      />
    </div>
  );
};

export default DashboardRecruiter; 