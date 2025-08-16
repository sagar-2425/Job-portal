import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaBuilding, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './JobForm.css';

const EditJobForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salaryRange: {
      min: '',
      max: ''
    },
    jobType: 'full-time',
    experienceLevel: 'entry',
    isActive: true
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ label: '', type: 'text', required: false, options: '', placeholder: '' });
  const [editingIdx, setEditingIdx] = useState(null);
  const [editQuestion, setEditQuestion] = useState({ label: '', type: 'text', required: false, options: '', placeholder: '' });

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const job = await jobService.getJob(id);
      
      // Check if the job belongs to the current user
      const jobRecruiterId = job.recruiterId._id || job.recruiterId;
      const currentUserId = user._id || user.id;
      
      if (jobRecruiterId !== currentUserId) {
        console.log('Job recruiter ID:', jobRecruiterId);
        console.log('Current user ID:', currentUserId);
        console.log('User object:', user);
        console.log('Job object:', job);
        toast.error('You can only edit your own jobs');
        navigate('/dashboard/recruiter');
        return;
      }

      // Map job type back to form format
      let jobType = 'full-time';
      switch (job.type) {
        case 'Full-time':
          jobType = 'full-time';
          break;
        case 'Part-time':
          jobType = 'part-time';
          break;
        case 'Remote':
          jobType = 'remote';
          break;
        default:
          jobType = 'full-time';
      }

      // Extract experience level from tags
      const experienceLevel = job.tags?.find(tag => ['entry', 'mid', 'senior', 'executive'].includes(tag)) || 'entry';

      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        description: job.description || '',
        requirements: job.requirements || '',
        salaryRange: {
          min: job.salaryRange?.min?.toString() || '',
          max: job.salaryRange?.max?.toString() || ''
        },
        jobType,
        experienceLevel,
        isActive: job.isActive !== undefined ? job.isActive : true
      });
      setCustomQuestions(job.customQuestions || []);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
      navigate('/dashboard/recruiter');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData(prev => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [name === 'salaryMin' ? 'min' : 'max']: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addCustomQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.label.trim()) return;
    const question = {
      label: newQuestion.label.trim(),
      type: newQuestion.type,
      required: newQuestion.required,
      options: (newQuestion.type === 'select' || newQuestion.type === 'checkbox')
        ? newQuestion.options.split(',').map(opt => opt.trim()).filter(Boolean)
        : [],
      placeholder: newQuestion.placeholder || ''
    };
    setCustomQuestions([...customQuestions, question]);
    setNewQuestion({ label: '', type: 'text', required: false, options: '', placeholder: '' });
  };

  const removeCustomQuestion = (idx) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.salaryRange.min || !formData.salaryRange.max) {
      toast.error('Please provide salary range');
      return;
    }

    if (parseInt(formData.salaryRange.min) > parseInt(formData.salaryRange.max)) {
      toast.error('Minimum salary cannot be greater than maximum salary');
      return;
    }

    setSaving(true);

    try {
      const jobData = {
        ...formData,
        salaryRange: {
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max)
        },
        customQuestions
      };

      await jobService.updateJob(id, jobData);
      toast.success('Job updated successfully!');
      navigate(user && user.role === 'recruiter' ? '/dashboard/recruiter' : '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(user && user.role === 'recruiter' ? '/dashboard/recruiter' : '/');
  };

  if (loading) {
    return (
      <div className="job-form-page">
        <div className="job-form-container">
          <div className="job-form-card">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading job details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-page">
      <div className="job-form-container">
        <div className="job-form-card">
          <div className="job-form-header">
            <div className="job-form-icon">
              <FaEdit />
            </div>
            <h1 className="job-form-title">Edit Job Posting</h1>
            <p className="job-form-subtitle">Update your job posting to attract better candidates</p>
          </div>

          <form className="job-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  <FaBriefcase className="form-icon" />
                  Job Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company" className="form-label">
                  <FaBuilding className="form-icon" />
                  Company Name *
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  <FaMapMarkerAlt className="form-icon" />
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., New York, NY or Remote"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Job Details</h3>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requirements" className="form-label">
                  Requirements & Qualifications
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="List the key requirements, skills, and qualifications needed for this role. For skills, separate them with commas (e.g., JavaScript, React, Node.js)..."
                  rows="4"
                />
                <small className="form-help-text">
                  💡 Tip: Separate skills with commas to display them as skill tags (e.g., "JavaScript, React, Node.js")
                </small>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Compensation & Details</h3>
              
              <div className="salary-range-group">
                <label className="form-label">
                  <FaDollarSign className="form-icon" />
                  Salary Range (USD) *
                </label>
                <div className="salary-inputs">
                  <div className="salary-input">
                    <input
                      name="salaryMin"
                      type="number"
                      value={formData.salaryRange.min}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Minimum"
                      required
                    />
                  </div>
                  <span className="salary-separator">to</span>
                  <div className="salary-input">
                    <input
                      name="salaryMax"
                      type="number"
                      value={formData.salaryRange.max}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Maximum"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="jobType" className="form-label">
                    <FaClock className="form-icon" />
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experienceLevel" className="form-label">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Job Status
                </label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Active (visible to job seekers)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Custom Application Questions</h3>
              <div className="custom-questions-list">
                {customQuestions.length === 0 && (
                  <div className="no-custom-questions">No custom questions added yet.</div>
                )}
                {customQuestions.map((q, idx) => (
                  <div className="custom-question-item" key={idx}>
                    {editingIdx === idx ? (
                      <div className="edit-custom-question-fields">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Question label"
                          value={editQuestion.label}
                          onChange={e => setEditQuestion({ ...editQuestion, label: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Placeholder (optional)"
                          value={editQuestion.placeholder}
                          onChange={e => setEditQuestion({ ...editQuestion, placeholder: e.target.value })}
                        />
                        <select
                          className="form-control"
                          value={editQuestion.type}
                          onChange={e => setEditQuestion({ ...editQuestion, type: e.target.value, options: '' })}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Paragraph</option>
                          <option value="select">Dropdown</option>
                          <option value="checkbox">Checkboxes</option>
                        </select>
                        {(editQuestion.type === 'select' || editQuestion.type === 'checkbox') && (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Options (comma separated)"
                            value={editQuestion.options}
                            onChange={e => setEditQuestion({ ...editQuestion, options: e.target.value })}
                            required
                          />
                        )}
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={editQuestion.required}
                            onChange={e => setEditQuestion({ ...editQuestion, required: e.target.checked })}
                          />
                          Required
                        </label>
                        <button type="button" className="save-question-btn" onClick={() => {
                          const updated = [...customQuestions];
                          updated[idx] = {
                            ...editQuestion,
                            options: (editQuestion.type === 'select' || editQuestion.type === 'checkbox')
                              ? editQuestion.options.split(',').map(opt => opt.trim()).filter(Boolean)
                              : []
                          };
                          setCustomQuestions(updated);
                          setEditingIdx(null);
                        }}>Save</button>
                        <button type="button" className="cancel-question-btn" onClick={() => setEditingIdx(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div className="custom-question-label">
                          <strong>{q.label}</strong> <span className="custom-question-type">[{q.type}]</span> {q.required && <span className="required-star">*</span>}
                          {q.placeholder && <span className="custom-question-placeholder">Placeholder: {q.placeholder}</span>}
                          {q.type === 'select' || q.type === 'checkbox' ? (
                            <span className="custom-question-options">Options: {q.options.join(', ')}</span>
                          ) : null}
                        </div>
                        <button type="button" className="edit-question-btn" onClick={() => {
                          setEditingIdx(idx);
                          setEditQuestion({
                            label: q.label,
                            type: q.type,
                            required: q.required,
                            options: (q.type === 'select' || q.type === 'checkbox') ? (q.options || []).join(', ') : '',
                            placeholder: q.placeholder || ''
                          });
                        }}>Edit</button>
                        <button type="button" className="remove-question-btn" onClick={() => removeCustomQuestion(idx)} title="Remove question">
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form className="add-custom-question-form">
                <div className="form-row">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Question label (e.g., Why do you want this job?)"
                    value={newQuestion.label}
                    onChange={e => setNewQuestion({ ...newQuestion, label: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Placeholder (optional)"
                    value={newQuestion.placeholder}
                    onChange={e => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
                  />
                  <select
                    className="form-control"
                    value={newQuestion.type}
                    onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value, options: '' })}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Paragraph</option>
                    <option value="select">Dropdown</option>
                    <option value="checkbox">Checkboxes</option>
                  </select>
                  {(newQuestion.type === 'select' || newQuestion.type === 'checkbox') && (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Options (comma separated)"
                      value={newQuestion.options}
                      onChange={e => setNewQuestion({ ...newQuestion, options: e.target.value })}
                      required
                    />
                  )}
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newQuestion.required}
                      onChange={e => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                    />
                    Required
                  </label>
                  <button type="button" className="add-question-btn" onClick={addCustomQuestion}>Add</button>
                </div>
              </form>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={saving}
                className="submit-btn"
              >
                {saving ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Updating Job...</span>
                  </div>
                ) : (
                  <>
                    <FaSave />
                    Update Job
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJobForm; 