import React from 'react';
import './Buttons.css'; 

/* Reusable Button Component 
  Props:
  - children: The text or content inside the button
  - onClick: The function to execute when clicked
  - variant: 'primary' (blue theme) or 'secondary' (gray/transparent theme)
  - type: HTML button type ('button', 'submit')
*/
const Button = ({ children, onClick, variant = 'primary', type = 'button' }) => {
  // Determine which CSS class to apply based on the chosen variant
  const buttonClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button 
      className={`base-btn ${buttonClass}`} 
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;