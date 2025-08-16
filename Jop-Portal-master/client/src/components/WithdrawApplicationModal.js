import React from 'react';

const WithdrawApplicationModal = ({ isOpen, onCancel, onConfirm, jobTitle, submitting }) => {
  if (!isOpen) return null;
  return (
    <div className="custom-modal-overlay" onClick={onCancel}>
      <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
        <button className="custom-modal-close" onClick={onCancel}>&times;</button>
        <h2 className="modal-title">Withdraw Application</h2>
        <p>Are you sure you want to withdraw your application for <b>{jobTitle}</b>?</p>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="seeker-app-btn withdraw" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Withdrawing...' : 'Yes, Withdraw'}
          </button>
          <button className="seeker-app-btn outline" onClick={onCancel} disabled={submitting}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawApplicationModal; 