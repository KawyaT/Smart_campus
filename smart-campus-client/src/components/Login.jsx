import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const location = useLocation();
  const fromRegister = location.state?.fromRegister === true;
  const emailPrefill = typeof location.state?.email === 'string' ? location.state.email : '';

  const [formData, setFormData] = useState({
    email: emailPrefill,
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setIsSubmitting(false);
      return;
    }

    await login(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue to Smart Campus</p>
          </div>

          {fromRegister && (
            <div className="auth-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Your account was created. Enter your password below to sign in.
              </span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading || isSubmitting}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading || isSubmitting}
                  className="auth-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
};

export default Login;
