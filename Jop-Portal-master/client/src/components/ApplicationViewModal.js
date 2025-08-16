import React from 'react';
import Modal from 'react-modal';

const ApplicationViewModal = ({ isOpen, onRequestClose, application, jobDetails, onEdit }) => {
  if (!application || !jobDetails) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="View Application"
      ariaHideApp={false}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="application-view-modal-wide">
        <h2 className="modal-title">Application Details</h2>
        <div className="view-app-card">
          <div className="view-app-row">
            <div className="view-app-label">Name:</div>
            <div className="view-app-value">{application.name}</div>
          </div>
          <div className="view-app-row">
            <div className="view-app-label">Email:</div>
            <div className="view-app-value">{application.email}</div>
          </div>
          <div className="view-app-row">
            <div className="view-app-label">Resume:</div>
            <div className="view-app-value"><a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></div>
          </div>
          <div className="view-app-row">
            <div className="view-app-label">Cover Letter:</div>
            <div className="view-app-value"><div className="cover-letter">{application.coverLetter}</div></div>
          </div>
          {jobDetails.customQuestions && jobDetails.customQuestions.length > 0 && (
            <div className="view-app-row view-app-qna">
              <div className="view-app-label">Custom Questions & Answers:</div>
              <div className="view-app-value">
                {jobDetails.customQuestions.map((q, idx) => (
                  <div key={idx} className="view-app-qna-item"><b>{q.label}:</b> {Array.isArray(application.customAnswers?.[idx]) ? application.customAnswers[idx].join(', ') : application.customAnswers?.[idx] || <em>Not answered</em>}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="seeker-app-btn edit" onClick={onEdit}>Edit</button>
          <button className="seeker-app-btn outline" onClick={onRequestClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationViewModal; 