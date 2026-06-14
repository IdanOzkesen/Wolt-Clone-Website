import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: '',
    userDisplayName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    profilePhoto: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : (type === 'checkbox' ? checked : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    if (formData.profilePhoto) {
      console.log('File Name:', formData.profilePhoto.name);
      console.log('File Size:', formData.profilePhoto.size, 'bytes');
    }
  };


  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>

        <input name="userName" placeholder="Full name" value={formData.userName} onChange={handleChange} />
        <input name="userDisplayName" placeholder="User display name" value={formData.userDisplayName} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
        <input name="phoneNumber" type="tel" placeholder="Phone number" value={formData.phoneNumber} onChange={handleChange} />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        <input
          name="profilePhoto"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;
