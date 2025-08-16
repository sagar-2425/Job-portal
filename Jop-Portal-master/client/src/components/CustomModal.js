import React from 'react';
import './CustomModal.css';

const CustomModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
        <button className="custom-modal-close" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

export default CustomModal; 