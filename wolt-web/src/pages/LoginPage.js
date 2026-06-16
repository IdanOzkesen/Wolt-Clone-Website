import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import DynamicForm from "../components/DynamicForm";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/discovery', { replace: true });
    }
  }, [navigate]);

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
