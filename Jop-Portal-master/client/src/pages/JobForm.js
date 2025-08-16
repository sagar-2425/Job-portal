import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './JobForm.css';

const JobForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
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

    setLoading(true);

    try {
      const jobData = {
        ...formData,
        salaryRange: {
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max)
        },
        recruiterId: user.id,
        customQuestions
      };

      await jobService.createJob(jobData);
      toast.success('Job posted successfully!');
      navigate('/dashboard/recruiter');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/recruiter');
  };

  return (
    <div className="job-form-page">
      <div className="job-form-container">
        <div className="job-form-card">
          <div className="job-form-header">
            <div className="job-form-icon">
              <FaBriefcase />
            </div>
            <h1 className="job-form-title">Post a New Job</h1>
            <p className="job-form-subtitle">Create a compelling job posting to attract top talent</p>
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
              <h3 className="section-title">Custom Questions</h3>
              <div className="custom-questions-list">
                {customQuestions.length === 0 && <p className="text-muted">No custom questions added yet.</p>}
                {customQuestions.map((q, idx) => (
                  <div key={idx} className="custom-question-item">
                    <span className="custom-question-label">{q.label}</span>
                    <span className="custom-question-type">[{q.type}{q.required ? ', required' : ''}{q.options && q.options.length > 0 ? ', options: ' + q.options.join(', ') : ''}]</span>
                    <button type="button" className="remove-question-btn" onClick={() => removeCustomQuestion(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-question-form">
                <input
                  type="text"
                  placeholder="Question label (e.g., Languages Known)"
                  value={newQuestion.label}
                  onChange={e => setNewQuestion({ ...newQuestion, label: e.target.value })}
                  className="form-control"
                  required
                />
                <input
                  type="text"
                  placeholder="Placeholder (optional)"
                  value={newQuestion.placeholder}
                  onChange={e => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
                  className="form-control"
                />
                <select
                  value={newQuestion.type}
                  onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  className="form-control"
                >
                  <option value="text">Short Answer</option>
                  <option value="textarea">Paragraph</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkboxes</option>
                </select>
                {(newQuestion.type === 'select' || newQuestion.type === 'checkbox') && (
                  <input
                    type="text"
                    placeholder="Options (comma separated)"
                    value={newQuestion.options}
                    onChange={e => setNewQuestion({ ...newQuestion, options: e.target.value })}
                    className="form-control"
                  />
                )}
                <label className="custom-question-required" htmlFor="custom-required-checkbox">
                  <input
                    id="custom-required-checkbox"
                    type="checkbox"
                    checked={newQuestion.required}
                    onChange={e => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                  />
                  <span style={{ color: '#000' }}>Required?</span>
                </label>
                <button type="button" className="add-question-btn" onClick={addCustomQuestion}>Add Question</button>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Posting Job...</span>
                  </div>
                ) : (
                  <>
                    <FaSave />
                    Post Job
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

export default JobForm; 