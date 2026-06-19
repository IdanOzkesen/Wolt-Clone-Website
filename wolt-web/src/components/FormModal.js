import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DynamicForm from './DynamicForm';
import './FormModal.css';

function FormModal({ isOpen, onClose, title, fields, initialValues, submitLabel, onSubmit, validate }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (formData) => {
    if (validate) {
      const validationErrors = validate(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return; 
      }
    }
    
    setErrors({});
    onSubmit(formData);
  };

  return createPortal(
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="form-modal-close" onClick={onClose} aria-label="Close">✕</button>
        
        {Object.keys(errors).length > 0 && (
          <div className="form-errors" style={{ 
            color: '#d93025', 
            backgroundColor: '#fce8e6', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {Object.values(errors).map((errorMsg, index) => (
              <p key={index} style={{ margin: '5px 0' }}>{errorMsg}</p>
            ))}
          </div>
        )}

        <DynamicForm
          hideContainer
          formClassName="form-modal-form"
          title={title}
          fields={fields}
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
          submitLabel={submitLabel}
          submitClassName="form-modal-submit"
        />
      </div>
    </div>,
    document.body
  );
}

export default FormModal;