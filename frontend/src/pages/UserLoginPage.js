import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';

export default function UserLoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleMode = e => {
    e.preventDefault();
    setIsSignup(!isSignup);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      localStorage.removeItem('em_token');
      localStorage.removeItem('em_user');
      const res = await (isSignup
        ? registerUser(form)
        : loginUser({ email: form.email, password: form.password }));
      const { token, ...userData } = res.data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-switch-btn" onClick={() => navigate('/admin/login')}>
        Switch to Admin
      </button>

      <div className="auth-container">
        {/* Left blue banner */}
        <div className="auth-banner">
          <h1>ElectroMart</h1>
          <p style={{ fontWeight: 500, marginTop: 4 }}>User Login</p>
          <p>Secure login using Spring Boot &amp; MySQL</p>
        </div>

        {/* Right form card */}
        <div className="auth-form-card">
          <h2>{isSignup ? 'User Signup' : 'User Login'}</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <input
                  className="form-control"
                  placeholder="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <input
                className="form-control"
                placeholder="Username"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                placeholder="Password"
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
            </button>
          </form>

          <p className="auth-link">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <a href="#" onClick={toggleMode}>
              {isSignup ? 'Login' : 'Signup'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
