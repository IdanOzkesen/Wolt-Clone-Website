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
  initialValues = {},
}) => {
  const initialState = fields.reduce((acc, field) => ({ ...acc, [field.name]: initialValues[field.name] ?? '' }), {});

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(() => {
    const fileField = fields.find(field => field.type === 'file');
    return fileField ? (initialValues[fileField.name] || null) : null;
  });

  // פונקציית עזר שמזהה אם השדה קשור למספרים
  const isNumberField = (field) => {
    if (!field) return false;
    const name = (field.name || '').toLowerCase();
    const label = (field.label || '').toLowerCase();

    return (
      name.includes('number') ||
      name.includes('num') ||
      label.includes('number') ||
      label.includes('num')
    );
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // מוצאים את השדה הנוכחי מתוך מערך השדות
    const currentField = fields.find(f => f.name === name);

    if (type === 'file' && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [name]: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      let finalValue = value;

      if (isNumberField(currentField)) {
        finalValue = finalValue.replace(/\D/g, '');
      }

      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getSubmitData = () =>
    fields.reduce((acc, field) => {
      acc[field.name] = formData[field.name];
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
              placeholder={field.placeholder}
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