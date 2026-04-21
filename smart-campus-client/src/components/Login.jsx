import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ORIGIN } from '../api/client';
import './Login.css';

const Login = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthBanner, setOauthBanner] = useState('');

  useEffect(() => {
    const raw = searchParams.get('oauth_error');
    if (!raw) return;
    try {
      setOauthBanner(decodeURIComponent(raw));
    } catch {
      setOauthBanner(raw);
    }
    const next = new URLSearchParams(searchParams);
    next.delete('oauth_error');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read oauth_error once on landing
  }, []);

  const fromRegister = location.state?.fromRegister === true;
  const emailPrefill = typeof location.state?.email === 'string' ? location.state.email : '';
  const oauthErr =
    oauthBanner || (typeof location.state?.oauthError === 'string' ? location.state.oauthError : '');

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
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to SmartUni</p>
        </div>

        {fromRegister && (
          <div className="auth-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            <span>Your account was created. Enter your password below to sign in.</span>
          </div>
        )}

        {oauthErr && (
          <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            <span>{oauthErr}</span>
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

        <div className="auth-google-wrap">
          <button
            type="button"
            className="auth-google-btn"
            disabled={loading || isSubmitting}
            onClick={() => {
              window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
            }}
          >
            <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <div className="auth-divider" role="separator" aria-orientation="horizontal">
            <span className="auth-divider-line" aria-hidden />
            <span className="auth-divider-text">or sign in with email</span>
            <span className="auth-divider-line" aria-hidden />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading || isSubmitting}
                className="auth-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="auth-input-icon" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading || isSubmitting}
                className="auth-input"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading || isSubmitting}>
            {isSubmitting ? <span className="auth-submit-inner">Signing in…</span> : 'Sign In'}
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
