import React from 'react';

const EditApplicationForm = ({
  application,
  jobDetails,
  formData,
  customAnswers,
  onChange,
  onCustomChange,
  onSubmit,
  submitting,
  onCancel
}) => {
  if (!application || !jobDetails) return null;
  return (
    <form className="edit-application-form-wide" onSubmit={onSubmit} style={{ marginTop: 24, marginBottom: 24 }}>
      <h3 className="modal-title">Edit Application</h3>
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
      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button type="submit" className="seeker-app-btn primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" className="seeker-app-btn outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default EditApplicationForm; 