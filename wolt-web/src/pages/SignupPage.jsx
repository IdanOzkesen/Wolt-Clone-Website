import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    userName: '',
    userDisplayName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    profilePhoto: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const inputStyle = {
    padding: '12px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', backgroundColor: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>Sign Up</h2>
        
        <input name="userName" placeholder="Full name" value={formData.userName} onChange={handleChange} style={inputStyle} />
        <input name="userDisplayName" placeholder="User display name" value={formData.userDisplayName} onChange={handleChange} style={inputStyle} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} style={inputStyle} />
        <input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} />
        <input name="phoneNumber" type="tel" placeholder="Phone number" value={formData.phoneNumber} onChange={handleChange} style={inputStyle} />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} style={inputStyle} />
        <input name="profilePhoto" placeholder="Profile photo (URL)" value={formData.profilePhoto} onChange={handleChange} style={inputStyle} />

        <button type="submit" style={{ padding: '12px', backgroundColor: '#009de0', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;