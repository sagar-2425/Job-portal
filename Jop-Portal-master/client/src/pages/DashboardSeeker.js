import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { jobService } from '../services/jobService';
import Modal from 'react-modal';
import './DashboardSeeker.css';
import ApplicationViewModal from '../components/ApplicationViewModal';
import ApplicationEditModal from '../components/ApplicationEditModal';
import ViewApplicationDetails from '../components/ViewApplicationDetails';
import EditApplicationForm from '../components/EditApplicationForm';
import CustomModal from '../components/CustomModal';
import WithdrawApplicationModal from '../components/WithdrawApplicationModal';
import { savedJobService } from '../services/savedJobService';

const DashboardSeeker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    saved: 0,
    interview: 0,
    rejected: 0,
    shortlisted: 0,
    hired: 0
  });
  const [viewingAppId, setViewingAppId] = useState(null);
  const [editingAppId, setEditingAppId] = useState(null);
  const [inlineJobDetails, setInlineJobDetails] = useState(null);
  const [editApp, setEditApp] = useState(null);
  const [deleteApp, setDeleteApp] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editCustomAnswers, setEditCustomAnswers] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'view' or 'edit'
  const [modalApp, setModalApp] = useState(null);
  const [modalJobDetails, setModalJobDetails] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalApp(null);
    setModalJobDetails(null);
    setEditApp(null);
  };

  useEffect(() => {
    loadApplications();
    loadSavedJobs();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
      
      // Calculate stats
      const statsData = {
        total: data.length,
        applied: data.filter(app => app.status === 'Applied').length,
        saved: savedJobs.length, // Use saved jobs count instead of viewed
        shortlisted: data.filter(app => app.status === 'Shortlisted').length,
        rejected: data.filter(app => app.status === 'Rejected').length,
        hired: data.filter(app => app.status === 'Hired').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const data = await savedJobService.getSavedJobs();
      setSavedJobs(data);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  // Update stats when savedJobs changes
  useEffect(() => {
    if (applications.length > 0) {
      const statsData = {
        total: applications.length,
        applied: applications.filter(app => app.status === 'Applied').length,
        saved: savedJobs.length,
        shortlisted: applications.filter(app => app.status === 'Shortlisted').length,
        rejected: applications.filter(app => app.status === 'Rejected').length,
        hired: applications.filter(app => app.status === 'Hired').length
      };
      setStats(statsData);
    }
  }, [applications, savedJobs]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <FaClock className="text-blue-500" />;
      case 'Viewed':
        return <FaEye className="text-yellow-500" />;
      case 'Interview':
        return <FaBriefcase className="text-purple-500" />;
      case 'Rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'Hired':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Applied': 'badge-primary',
      'Viewed': 'badge-info',
      'Interview': 'badge-warning',
      'Rejected': 'badge-danger',
      'Hired': 'badge-success'
    };
    return statusColors[status] || 'badge-primary';
  };

  const openView = async (app) => {
    setModalType('view');
    setShowModal(true);
    setModalApp(app);
    const job = await jobService.getJob(app.jobId._id || app.jobId);
    setModalJobDetails(job);
  };
  const closeView = () => {
    setViewingAppId(null);
    setInlineJobDetails(null);
  };
  const openEdit = async (app) => {
    setModalType('edit');
    setShowModal(true);
    setModalApp(app);
    setEditApp(app);
    setEditFormData({
      name: app.name,
      email: app.email,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter
    });
    setEditCustomAnswers(app.customAnswers || {});
    const job = await jobService.getJob(app.jobId._id || app.jobId);
    setModalJobDetails(job);
  };
  const closeEdit = () => {
    setEditingAppId(null);
    setEditApp(null);
    setInlineJobDetails(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };
  const handleEditCustomChange = (qid, value) => {
    setEditCustomAnswers({ ...editCustomAnswers, [qid]: value });
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await applicationService.updateApplication(editApp._id, {
        ...editFormData,
        customAnswers: editCustomAnswers
      });
      toast.success('Application updated!');
      closeModal(); // Only close on success
      loadApplications();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update application';
      toast.error(message);
      // Do not close the modal
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDelete = (app) => {
    setDeleteApp(app);
    setShowWithdrawModal(true);
  };
  const closeDelete = () => {
    setDeleteApp(null);
    setShowWithdrawModal(false);
  };
  const confirmDelete = async () => {
    setWithdrawSubmitting(true);
    try {
      await applicationService.deleteApplication(deleteApp._id);
      toast.success('Application withdrawn');
      closeDelete();
      loadApplications();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to withdraw application';
      toast.error(message);
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const handleSavedClick = () => {
    navigate('/saved-jobs');
  };

  // Handler to contact recruiter
  const handleContactRecruiter = (application) => {
    const jobId = application.jobId._id || application.jobId;
    const recruiterId = application.jobId.recruiterId?._id || application.jobId.recruiterId;
    navigate(`/chat/${jobId}/${recruiterId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-seeker-page">
      <div className="dashboard-seeker-container">
        <div className="seeker-dashboard-stats-grid">
          <div className="seeker-stat-card">
            <div className="seeker-stat-number">{stats.total}</div>
            <div className="seeker-stat-label">Total Applications</div>
          </div>
          <div className="seeker-stat-card">
            <div className="seeker-stat-number">{stats.applied}</div>
            <div className="seeker-stat-label">Applied</div>
          </div>
          <div className="seeker-stat-card clickable" onClick={handleSavedClick} style={{ cursor: 'pointer' }}>
            <div className="seeker-stat-number">{stats.saved}</div>
            <div className="seeker-stat-label">Saved</div>
          </div>
          <div className="seeker-stat-card">
            <div className="seeker-stat-number">{stats.shortlisted}</div>
            <div className="seeker-stat-label">Shortlisted</div>
          </div>
          <div className="seeker-stat-card">
            <div className="seeker-stat-number">{stats.rejected}</div>
            <div className="seeker-stat-label">Rejected</div>
          </div>
          <div className="seeker-stat-card">
            <div className="seeker-stat-number">{stats.hired}</div>
            <div className="seeker-stat-label">Hired</div>
          </div>
        </div>
        <div className="seeker-dashboard-actions">
          <Link to="/jobs" className="seeker-action-btn primary">Browse Jobs</Link>
          <Link to="/profile" className="seeker-action-btn outline">Update Profile</Link>
        </div>
        <div className="seeker-applications-section">
          <div className="seeker-applications-header">
            <h2 className="seeker-applications-title">My Applications</h2>
            <Link to="/jobs" className="seeker-action-btn primary small">Find More Jobs</Link>
          </div>
          {applications.length === 0 ? (
            <div className="seeker-applications-empty">
              <p>No applications yet. Start your job search and apply to positions that match your skills.</p>
              <Link to="/jobs" className="seeker-action-btn primary">Browse Jobs</Link>
            </div>
          ) : (
            <div className="seeker-applications-grid">
              {applications.map((application) => (
                <React.Fragment key={application._id}>
                  <div className={`seeker-application-card status-${application.status?.toLowerCase()}`}> 
                    <div className="application-card-header">
                      <div>
                        <h3 className="job-title">
                          <Link to={`/jobs/${application.jobId?._id || application.jobId}`} className="job-link">{application.jobId?.title || ''}</Link>
                        </h3>
                        <div className="job-meta">
                          <span className="company">{application.jobId?.company || ''}</span>
                          <span className="location">{application.jobId?.location || ''}</span>
                        </div>
                      </div>
                      <div className={`application-status-badge status-badge`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status}</span>
                      </div>
                    </div>
                    <div className="application-card-body">
                      <div className="salary">
                        <span>Salary:</span> ${application.jobId?.salaryRange?.min?.toLocaleString?.() || ''} - ${application.jobId?.salaryRange?.max?.toLocaleString?.() || ''}
                      </div>
                      <div className="application-date">
                        <span>Applied:</span> {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="application-card-actions">
                      <button className="seeker-app-btn view" onClick={() => openView(application)}>View</button>
                      {application.status === 'Applied' && (
                        <button className="seeker-app-btn edit" onClick={() => openEdit(application)}>Edit</button>
                      )}
                      <button className="seeker-app-btn withdraw" onClick={() => openDelete(application)}>Withdraw</button>
                      {application.status === 'Shortlisted' && (
                        <Link
                          to={`/chat/${application.jobId?._id || application.jobId}/${application.jobId?.recruiterId?._id || application.jobId?.recruiterId}`}
                          className="seeker-app-btn contact"
                          style={{ marginLeft: 8 }}
                        >
                          Contact Recruiter
                        </Link>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {/* Delete/Withdraw Modal */}
        <WithdrawApplicationModal
          isOpen={showWithdrawModal && !!deleteApp}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          jobTitle={deleteApp?.jobId?.title || ''}
          submitting={withdrawSubmitting}
        />
        <CustomModal isOpen={showModal} onClose={closeModal}>
          {modalType === 'view' && modalApp && modalJobDetails && (
            <ViewApplicationDetails
              application={modalApp}
              jobDetails={modalJobDetails}
              onEdit={() => openEdit(modalApp)}
              onClose={closeModal}
            />
          )}
          {modalType === 'edit' && modalApp && modalJobDetails && (
            <EditApplicationForm
              application={modalApp}
              jobDetails={modalJobDetails}
              formData={editFormData}
              customAnswers={editCustomAnswers}
              onChange={handleEditChange}
              onCustomChange={handleEditCustomChange}
              onSubmit={submitEdit}
              submitting={editSubmitting}
              onCancel={closeModal}
            />
          )}
        </CustomModal>
      </div>
    </div>
  );
};

export default DashboardSeeker; 