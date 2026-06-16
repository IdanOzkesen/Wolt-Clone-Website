import React, { useState } from 'react';
import Button from './Buttons';
import BaseInputFieldWithError from './BaseInputFieldWithError';
import './DynamicForm.css';

const DynamicForm = ({ fields, onSubmit, submitLabel = "Submit", title }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let currentErrors = {};

    // ולידציה דינמית
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        currentErrors[field.name] = "This field is required";
      }
    });

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length === 0) {
      onSubmit(formData);
    }
  };

return (
    <div className="dynamic-form-container">
      <form className="dynamic-form" onSubmit={handleSubmit}>
        {title && <h2 className="form-title">{title}</h2>}
        
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
        <Button type="submit">{submitLabel}</Button>
      </form>
    </div>
  );
};

export default DynamicForm;