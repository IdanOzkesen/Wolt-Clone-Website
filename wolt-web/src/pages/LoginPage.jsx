import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { apiFetch } from "../services/api";
import BaseInputFieldWithError from "../components/BaseInputFieldWithError";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/discovery', { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    userName: '',
    password: ''
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

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) return;

    const userDataToSend = {
      name: formData.userName,
      password: formData.password
    };

    try {
      const response = await apiFetch('/token', {
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
        setErrors({ general: errorData.error || "Login failed. Please try again." });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please check if the server is running." });
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        {errors.general && <div className="base-input-error" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.general}</div>}

        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

        <div className="input-group">
          <label className="input-label">User Name</label>
          <BaseInputFieldWithError name="userName" placeholder="Enter your full name" value={formData.userName} onChange={handleChange} error={errors.userName} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <BaseInputFieldWithError name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} error={errors.password} />
        </div>

        <button type="submit" className="submit-btn">Login</button>
        <button type="button" className="link-btn" onClick={() => navigate('/signup')}>Don't have a user? Come join.</button>
      </form>
    </div>
  );
}

export default LoginPage;