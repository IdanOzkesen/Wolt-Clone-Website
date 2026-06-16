import { useEffect, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import DynamicForm from "../components/DynamicForm";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [generalError, setGeneralError] = useState("");

  // Location 1: Check if the user is already logged in (has a token).
  // If so, redirect to their previous destination or default to '/discovery'.
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const fromPath = location.state?.from || '/discovery';
      navigate(fromPath, { replace: true });
    }
  }, [navigate, location]);

  const fields = [
    { name: 'userName', label: 'User Name', placeholder: 'Enter your full name', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', required: true },
  ];

  const handleSubmit = async (formData) => {
    setGeneralError("");
    const result = await login(formData);
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
        title="Login"
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Login"
        submitClassName="submit-btn"
        generalError={generalError}
        footer={
          <button type="button" className="link-btn" onClick={() => navigate('/signup')}>
            Don't have a user? Come join.
          </button>
        }
      />
    </div>
  );
}

export default LoginPage;
