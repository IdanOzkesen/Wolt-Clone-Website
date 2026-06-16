import React, { useState } from 'react';
import Button from './Buttons';
import BaseInputFieldWithError from './BaseInputFieldWithError';
import './DynamicForm.css';

const DynamicForm = ({
  fields,
  onSubmit,
  submitLabel = "Submit",
  title,
  hideContainer = false,
  formClassName = "dynamic-form",
  generalError,
  footer,
  validate,
  submitClassName,
}) => {
  // יצירת אובייקט התחלתי ריק לפי השדות
  const initialState = fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getSubmitData = () =>
    fields.reduce((acc, field) => {
      if (field.type !== 'file') {
        acc[field.name] = formData[field.name];
      }
      return acc;
    }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {};

    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        currentErrors[field.name] = "This field is required";
      }
    });

    if (validate) {
      const extraErrors = validate(getSubmitData(), formData);
      currentErrors = { ...currentErrors, ...extraErrors };
    }

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length === 0) {
      await onSubmit(getSubmitData());
    }
  };

  const formContent = (
    <form className={formClassName} onSubmit={handleSubmit}>
      {title && <h2 className="form-title">{title}</h2>}

      {generalError && (
        <div className="base-input-error" style={{ textAlign: 'center', marginBottom: '10px' }}>
          {generalError}
        </div>
      )}
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label className="form-label">{field.label}</label>
          {field.type === 'file' ? (
            <div className="file-upload-wrapper">
              {imagePreview && <img src={imagePreview} alt="Preview" className="preview-img" />}
              <input type="file" name={field.name} onChange={handleChange} />
            </div>
          ) : (
            <BaseInputFieldWithError
              type={field.type}
              name={field.name}
              placeholder={field.placeholder} // ה-Placeholder מגיע מה-field
              value={formData[field.name]}
              onChange={handleChange}
              error={errors[field.name]}
            />
          )}
        </div>
      ))}
      {submitClassName ? (
        <button type="submit" className={submitClassName}>{submitLabel}</button>
      ) : (
        <Button type="submit">{submitLabel}</Button>
      )}
      {footer}
    </form>
  );

  if (hideContainer) {
    return formContent;
  }

  return (
    <div className="dynamic-form-container">
      {formContent}
    </div>
  );
};

export default DynamicForm;