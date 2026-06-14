import React from 'react';
import './BaseInputFieldWithError.css';
const BaseInputFieldWithError = React.forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  ...props
}, ref) => {
  return (
    <div className="base-input-container">
      <input
        ref={ref}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`base-input ${error ? 'has-error' : ''}`}
        {...props}
      />
      {error && <span className="base-input-error">{error}</span>}
    </div>
  );
});


export default BaseInputFieldWithError;