import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import DynamicForm from "../components/DynamicForm";
import { AuthContext } from "../context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/discovery', { replace: true });
    }
  }, [navigate]);

  const fields = [
    { name: 'userName', label: 'Full Name', placeholder: 'Enter your full name', required: true },
    { name: 'userDisplayName', label: 'Display Name', placeholder: 'Enter your display name', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number', required: true },
    { name: 'address', label: 'Address', placeholder: 'Enter your address', required: true },
    { name: 'profilePhoto', label: 'Profile Photo', type: 'file', required: false },
  ];

  const validateSignup = (submitData) => {
    const errors = {};
    if (submitData.password && submitData.confirmPassword && submitData.password !== submitData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = async (formData) => {
    setGeneralError("");
    const result = await signup(formData);
    if (result.success) {
      navigate('/discovery', { replace: true });
    } else {
      setGeneralError(result.error);
    }
  };

  return (
    <div className="page-container">
      <DynamicForm
        hideContainer
        formClassName="auth-form"
        title="Sign Up"
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Sign Up"
        submitClassName="submit-btn"
        generalError={generalError}
        validate={validateSignup}
        footer={
          <button type="button" className="link-btn" onClick={() => navigate('/login')}>
            Already have an account? Log in
          </button>
        }
      />
    </div>
  );
}

export default SignupPage;
