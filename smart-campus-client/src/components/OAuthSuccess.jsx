import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeJwtFromUrl, parseOAuthTokenFromWindow } from '../utils/oauthToken';
import './AuthPages.css';

/** Backend redirects here: /oauth-success?token=... (see OAuth2LoginSuccessHandler). */
const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleSignIn } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token =
      normalizeJwtFromUrl(searchParams.get('token')) || parseOAuthTokenFromWindow();
    const oauthError = searchParams.get('error');

    (async () => {
      if (oauthError) {
        navigate('/login', { replace: true, state: { oauthError } });
        return;
      }
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const result = await completeGoogleSignIn(token);
      if (!result.success) {
        navigate('/login', { replace: true, state: { oauthError: result.message } });
        return;
      }

      const role = result.user?.role;
      if (role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    })();
  }, [completeGoogleSignIn, navigate, searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-subtitle" style={{ textAlign: 'center', margin: 0 }}>
          Completing sign-in…
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
