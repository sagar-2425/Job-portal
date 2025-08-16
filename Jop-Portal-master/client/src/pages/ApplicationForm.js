import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import toast from 'react-hot-toast';
import './ApplicationForm.css';
import { useAuth } from '../context/AuthContext';

const ApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resumeUrl: '',
    coverLetter: ''
  });
  const [customAnswers, setCustomAnswers] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const loadJob = async () => {
    try {
      const jobData = await jobService.getJob(jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCustomChange = (qid, value) => {
    setCustomAnswers({ ...customAnswers, [qid]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please provide your name';
    if (!formData.email.trim()) newErrors.email = 'Please provide your email';
    if (!formData.resumeUrl.trim()) newErrors.resumeUrl = 'Please provide a resume URL';
    if (!formData.coverLetter.trim()) newErrors.coverLetter = 'Please write a cover letter';
    if (job && job.customQuestions) {
      job.customQuestions.forEach((q, idx) => {
        if (q.required && (!customAnswers[idx] || (Array.isArray(customAnswers[idx]) ? customAnswers[idx].length === 0 : !customAnswers[idx].toString().trim()))) {
          newErrors[`custom_${idx}`] = 'This field is required';
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await applicationService.applyForJob({
        jobId,
        name: formData.name,
        email: formData.email,
        resumeUrl: formData.resumeUrl,
        coverLetter: formData.coverLetter,
        customAnswers
      });
      toast.success('Application submitted successfully!');
      navigate('/dashboard/seeker');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-apply-page-outer">
      <div className="back-link-global-wrapper">
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
          className="back-link-global"
          >
          <FaArrowLeft /> Back to Job Details
          </button>
        </div>
      <div className="job-apply-page">
        <div className="job-apply-container">
          <div className="job-apply-card">
            <div className="job-apply-header">
              <h1 className="job-apply-title">Apply for {job.title}</h1>
              <p className="job-apply-subtitle">at {job.company}</p>
                </div>
            <form className="job-apply-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="section-title">Your Application</h3>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your full name"
                    required
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="resumeUrl" className="form-label">Resume URL *</label>
                    <input
                      type="url"
                      id="resumeUrl"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleChange}
                    className="form-control"
                      placeholder="https://example.com/resume.pdf"
                      required
                    />
                  {errors.resumeUrl && <div className="form-error">{errors.resumeUrl}</div>}
                  <small className="form-help-text">Upload your resume to a cloud service and provide the link</small>
                </div>
                <div className="form-group">
                  <label htmlFor="coverLetter" className="form-label">Cover Letter *</label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                    className="form-control"
                    placeholder="Write a compelling cover letter..."
                    rows="6"
                      required
                    />
                  {errors.coverLetter && <div className="form-error">{errors.coverLetter}</div>}
                  <small className="form-help-text">Explain your interest in the position and why you're a great candidate</small>
                </div>
              </div>
              {job.customQuestions && job.customQuestions.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title">Additional Questions</h3>
                  {job.customQuestions.map((q, idx) => (
                    <div className="form-group" key={idx}>
                      <label className="form-label">
                        {q.label} {q.required && <span className="required-star">*</span>}
                      </label>
                      {q.type === 'text' && (
                        <input
                          type="text"
                          className="form-control"
                          value={customAnswers[idx] || ''}
                          onChange={e => handleCustomChange(idx, e.target.value)}
                          placeholder={q.placeholder || q.label}
                          required={q.required}
                        />
                      )}
                      {q.type === 'textarea' && (
                        <textarea
                          className="form-control"
                          value={customAnswers[idx] || ''}
                          onChange={e => handleCustomChange(idx, e.target.value)}
                          placeholder={q.placeholder || q.label}
                          rows="4"
                          required={q.required}
                        />
                      )}
                      {q.type === 'select' && (
                        <select
                          className="form-control"
                          value={customAnswers[idx] || ''}
                          onChange={e => handleCustomChange(idx, e.target.value)}
                          required={q.required}
                        >
                          <option value="">Select...</option>
                          {q.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {q.type === 'checkbox' && (
                        <div className="checkbox-group">
                          {q.options.map((opt, i) => (
                            <label key={i} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={Array.isArray(customAnswers[idx]) && customAnswers[idx].includes(opt)}
                                onChange={e => {
                                  let arr = Array.isArray(customAnswers[idx]) ? [...customAnswers[idx]] : [];
                                  if (e.target.checked) arr.push(opt);
                                  else arr = arr.filter(v => v !== opt);
                                  handleCustomChange(idx, arr);
                                }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {errors[`custom_${idx}`] && <div className="form-error">{errors[`custom_${idx}`]}</div>}
                    </div>
                  ))}
                </div>
              )}
              <div className="form-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                  className="submit-btn"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm; 