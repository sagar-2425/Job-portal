import React from 'react';
import Modal from 'react-modal';

const ApplicationEditModal = ({
  isOpen,
  onRequestClose,
  application,
  jobDetails,
  formData,
  customAnswers,
  onChange,
  onCustomChange,
  onSubmit,
  submitting
}) => {
  if (!application || !jobDetails) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Application"
      ariaHideApp={false}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="modal-title">Edit Application</h2>
      <form onSubmit={onSubmit} className="modal-form">
        <input type="text" name="name" value={formData.name} onChange={onChange} className="form-control" placeholder="Full Name" required />
        <input type="email" name="email" value={formData.email} onChange={onChange} className="form-control" placeholder="Email" required />
        <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={onChange} className="form-control" placeholder="Resume URL" required />
        <textarea name="coverLetter" value={formData.coverLetter} onChange={onChange} className="form-control" placeholder="Cover Letter" rows="5" required />
        {jobDetails.customQuestions && jobDetails.customQuestions.length > 0 && (
          <div>
            <h4>Custom Questions</h4>
            {jobDetails.customQuestions.map((q, idx) => (
              <div key={idx} className="form-group">
                <label>{q.label}{q.required && ' *'}</label>
                {q.type === 'text' && (
                  <input type="text" className="form-control" value={customAnswers[idx] || ''} onChange={e => onCustomChange(idx, e.target.value)} placeholder={q.placeholder || q.label} required={q.required} />
                )}
                {q.type === 'textarea' && (
                  <textarea className="form-control" value={customAnswers[idx] || ''} onChange={e => onCustomChange(idx, e.target.value)} placeholder={q.placeholder || q.label} rows="4" required={q.required} />
                )}
                {q.type === 'select' && (
                  <select className="form-control" value={customAnswers[idx] || ''} onChange={e => onCustomChange(idx, e.target.value)} required={q.required}>
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
                        <input type="checkbox" checked={Array.isArray(customAnswers[idx]) && customAnswers[idx].includes(opt)} onChange={e => {
                          let arr = Array.isArray(customAnswers[idx]) ? [...customAnswers[idx]] : [];
                          if (e.target.checked) arr.push(opt);
                          else arr = arr.filter(v => v !== opt);
                          onCustomChange(idx, arr);
                        }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button type="submit" className="seeker-app-btn primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="seeker-app-btn outline" onClick={onRequestClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationEditModal; 