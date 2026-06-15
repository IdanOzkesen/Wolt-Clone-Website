import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import BaseInputFieldWithError from "../components/BaseInputFieldWithError";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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

    const result = await login(formData);
    if (result.success) {
      navigate('/discovery', { replace: true });
    }
    setErrors({ general: result.error });
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        {errors.general && <div className="base-input-error" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.general}</div>}

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