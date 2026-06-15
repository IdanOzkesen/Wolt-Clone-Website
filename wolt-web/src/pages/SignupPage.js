import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import BaseInputFieldWithError from "../components/BaseInputFieldWithError";
import { AuthContext } from "../context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

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
      if (!formData[key] && key !== 'profilePhoto') {
        currentErrors[key] = "This field is required";
      }
    });

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      currentErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) return;

    const result = await signup(formData);
    if (result.success) {
      navigate('/discovery', { replace: true });
    }
    setErrors({general: result.error});
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>

        {errors.general && <div className="base-input-error" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.general}</div>}

        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

        <div className="input-group">
          <label className="input-label">Full Name</label>
          <BaseInputFieldWithError name="userName" placeholder="Enter your full name" value={formData.userName} onChange={handleChange} error={errors.userName} />
        </div>

        <div className="input-group">
          <label className="input-label">Display Name</label>
          <BaseInputFieldWithError name="userDisplayName" placeholder="Enter your display name" value={formData.userDisplayName} onChange={handleChange} error={errors.userDisplayName} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <BaseInputFieldWithError name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} error={errors.password} />
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <BaseInputFieldWithError name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        </div>

        <div className="input-group">
          <label className="input-label">Phone Number</label>
          <BaseInputFieldWithError name="phoneNumber" type="tel" placeholder="Enter your phone number" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
        </div>

        <div className="input-group">
          <label className="input-label">Address</label>
          <BaseInputFieldWithError name="address" placeholder="Enter your address" value={formData.address} onChange={handleChange} error={errors.address} />
        </div>

        <div className="input-group">
          <label className="input-label">Profile Photo</label>
          <BaseInputFieldWithError
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleChange}
            error={errors.profilePhoto}
          />
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
        <button type="button" className="link-btn" onClick={() => navigate('/login')}>Already have an account? Log in</button>
      </form>
    </div>
  );
}

export default SignupPage;