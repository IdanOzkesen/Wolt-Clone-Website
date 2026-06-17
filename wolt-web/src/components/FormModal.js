import React from 'react';
import { createPortal } from 'react-dom';
import DynamicForm from './DynamicForm';
import './FormModal.css';

// Generic popup that hosts a DynamicForm.
// Used by the restaurant owner to edit a restaurant, add a product and edit a product.
function FormModal({ isOpen, onClose, title, fields, initialValues, submitLabel, onSubmit }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="form-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <DynamicForm
          hideContainer
          formClassName="form-modal-form"
          title={title}
          fields={fields}
          initialValues={initialValues}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          submitClassName="form-modal-submit"
        />
      </div>
    </div>,
    document.body
  );
}

export default FormModal;
