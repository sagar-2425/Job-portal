import React from 'react';

const ViewApplicationDetails = ({ application, jobDetails, onEdit, onClose }) => {
  if (!application || !jobDetails) return null;
  return (
    <div className="view-application-details seeker-applications-section" style={{ marginTop: 24, marginBottom: 24 }}>
      <h3 className="modal-title">Application Details</h3>
      <div className="modal-section"><b>Name:</b> {application.name}</div>
      <div className="modal-section"><b>Email:</b> {application.email}</div>
      <div className="modal-section"><b>Resume:</b> <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></div>
      <div className="modal-section"><b>Cover Letter:</b> <div className="cover-letter">{application.coverLetter}</div></div>
      {jobDetails.customQuestions && jobDetails.customQuestions.length > 0 && (
        <div className="modal-section">
          <h4>Custom Questions & Answers</h4>
          {jobDetails.customQuestions.map((q, idx) => (
            <div key={idx}><b>{q.label}:</b> {Array.isArray(application.customAnswers?.[idx]) ? application.customAnswers[idx].join(', ') : application.customAnswers?.[idx] || <em>Not answered</em>}</div>
          ))}
        </div>
      )}
      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button className="seeker-app-btn edit" onClick={onEdit}>Edit</button>
        <button className="seeker-app-btn outline" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ViewApplicationDetails; 