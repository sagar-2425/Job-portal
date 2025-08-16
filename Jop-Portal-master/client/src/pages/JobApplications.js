import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaPhone, FaCalendar, FaDownload, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './DashboardRecruiter.css';
import ChatBox from '../components/ChatModal';

const JobApplications = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpenId, setChatOpenId] = useState(null);
  const [chatApplicant, setChatApplicant] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      navigate('/');
      return;
    }
    loadJobAndApplications();
    // eslint-disable-next-line
  }, [jobId]);

  const loadJobAndApplications = async () => {
    setLoading(true);
    try {
      const jobData = await jobService.getJob(jobId);
      setJob(jobData);
      const apps = await applicationService.getJobApplications(jobId);
      setApplications(apps);
    } catch (error) {
      toast.error('Failed to load job or applications');
      navigate('/dashboard/recruiter');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(appId, newStatus);
      setApplications(apps => apps.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      let msg = '';
      if (newStatus === 'Shortlisted') msg = 'Applicant shortlisted!';
      else if (newStatus === 'Rejected') msg = 'Applicant rejected!';
      else if (newStatus === 'Reviewed') msg = 'Application marked as reviewed!';
      else msg = `Status updated to ${newStatus}!`;
      toast.success(msg);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Handler to go to chat page
  const handleContactApplicant = (application) => {
    const applicantId =
      (application.seekerId && typeof application.seekerId === 'object' ? application.seekerId._id : application.seekerId) ||
      (application.applicantId && typeof application.applicantId === 'object' ? application.applicantId._id : application.applicantId) ||
      application._id;
    navigate(`/chat/${jobId}/${applicantId}`);
  };

  // Handler to close chat box
  const handleCloseChat = () => {
    setChatOpenId(null);
    setChatApplicant(null);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dashboard-loading">
        <div className="error-state">
          <h2 className="error-title">Job not found</h2>
          <Link to="/dashboard/recruiter" className="back-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="applications-header">
          <Link to="/dashboard/recruiter" className="back-btn">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div className="applications-header-main">
            <h2 className="section-title">Applications for: {job.title}</h2>
            <span className="applications-count">{applications.length} Application{applications.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {applications.length === 0 ? (
          <div className="applications-empty">
            <p>No applications received for this job yet.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application._id} className="application-item modern-app-card">
                <div className="application-header">
                  <div className="applicant-info">
                    <h3 className="applicant-name">{application.name || 'Unknown Applicant'}</h3>
                    <p className="applicant-email">
                      <FaEnvelope />
                      {application.email || 'No email provided'}
                    </p>
                  </div>
                  <div className="application-meta">
                    <span className={`application-status badge ${application.status?.toLowerCase() || 'applied'}`}>{application.status || 'Applied'}</span>
                    <span className="application-date">
                      <FaCalendar />
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="application-content">
                  <div className="application-section">
                    <h4 className="section-subtitle">Resume</h4>
                    <div className="resume-section">
                      {application.resumeUrl ? (
                        <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link resume-download-btn">
                          <FaDownload style={{ marginRight: 6 }} />
                          View Resume
                        </a>
                      ) : (
                        <span>No resume provided</span>
                      )}
                    </div>
                  </div>
                  {application.coverLetter && (
                    <div className="application-section">
                      <h4 className="section-subtitle">Cover Letter</h4>
                      <div className="cover-letter">
                        {application.coverLetter}
                      </div>
                    </div>
                  )}
                  {/* Custom Questions/Answers */}
                  {job && job.customQuestions && job.customQuestions.length > 0 && (
                    <div className="application-section">
                      <h4 className="section-subtitle">Custom Questions & Answers</h4>
                      <div className="custom-answers-list">
                        {job.customQuestions.map((q, idx) => (
                          <div key={idx} className="custom-answer-item">
                            <span className="custom-question-label">{q.label}:</span>
                            <span className="custom-answer-value">{Array.isArray(application.customAnswers?.[idx]) ? application.customAnswers[idx].join(', ') : application.customAnswers?.[idx] || <em>Not answered</em>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="application-actions">
                  <button
                    className="action-btn primary"
                    aria-label="Contact Applicant"
                    onClick={() => handleContactApplicant(application)}
                  >
                    <FaEnvelope />
                    Contact Applicant
                  </button>
                  <button
                    className="action-btn"
                    aria-label="Shortlist Applicant"
                    disabled={application.status === 'Shortlisted'}
                    onClick={() => handleStatusChange(application._id, 'Shortlisted')}
                  >
                    Shortlist
                  </button>
                  <button
                    className="action-btn"
                    aria-label="Reject Applicant"
                    disabled={application.status === 'Rejected'}
                    onClick={() => handleStatusChange(application._id, 'Rejected')}
                  >
                    Reject
                  </button>
                  <button
                    className="action-btn"
                    aria-label="Mark as Reviewed"
                    disabled={application.status === 'Reviewed'}
                    onClick={() => handleStatusChange(application._id, 'Reviewed')}
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    className="action-btn"
                    aria-label="Hire Applicant"
                    disabled={application.status === 'Hired'}
                    onClick={() => handleStatusChange(application._id, 'Hired')}
                  >
                    Hire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications; 