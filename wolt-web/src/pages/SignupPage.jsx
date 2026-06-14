import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { apiFetch, logout } from "../services/api";

function SignupPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/discovery', { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    userName: '',
    userDisplayName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    profilePhoto: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {};

    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        currentErrors[key] = "This field is required";
      }
    });

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      currentErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) return;

    console.log('Form submitted:', formData);

    const userDataToSend = {
      name: formData.userName,
      password: formData.password,
      address: formData.address,
      phoneNum: formData.phoneNumber
    };

    try {
      const response = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userDataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/discovery', { replace: true });
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || "Signup failed. Please try again." });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please check if the server is running." });
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>

        {errors.general && <div className="error-text general-error" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.general}</div>}

        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input className={`base-input ${errors.userName ? 'has-error' : ''}`} name="userName" placeholder="Enter your full name" value={formData.userName} onChange={handleChange} />
          {errors.userName && <span className="error-text">{errors.userName}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Display Name</label>
          <input className={`base-input ${errors.userDisplayName ? 'has-error' : ''}`} name="userDisplayName" placeholder="Enter your display name" value={formData.userDisplayName} onChange={handleChange} />
          {errors.userDisplayName && <span className="error-text">{errors.userDisplayName}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className={`base-input ${errors.password ? 'has-error' : ''}`} name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <input className={`base-input ${errors.confirmPassword ? 'has-error' : ''}`} name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Phone Number</label>
          <input className={`base-input ${errors.phoneNumber ? 'has-error' : ''}`} name="phoneNumber" type="tel" placeholder="Enter your phone number" value={formData.phoneNumber} onChange={handleChange} />
          {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Address</label>
          <input className={`base-input ${errors.address ? 'has-error' : ''}`} name="address" placeholder="Enter your address" value={formData.address} onChange={handleChange} />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">Profile Photo</label>
          <input
            className={`base-input ${errors.profilePhoto ? 'has-error' : ''}`}
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
          {errors.profilePhoto && <span className="error-text">{errors.profilePhoto}</span>}
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
        <button type="button" className="link-btn" onClick={() => navigate('/login')}>Already have an account? Log in</button>
      </form>
    </div>
  );
}

export default SignupPage;