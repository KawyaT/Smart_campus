import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

/** Normalize API user payload for client state (null-safe). */
function mapApiUser(me) {
  if (!me || typeof me !== 'object') return null;
  return {
    id: me.id,
    email: me.email,
    name: me.name,
    role: me.role,
    authProvider: me.authProvider ?? 'LOCAL',
    phone: me.phone ?? '',
    address: me.address ?? '',
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session: need both user profile and JWT
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(mapApiUser(JSON.parse(storedUser)));
    } else if (storedUser || token) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const u = mapApiUser(response.user);
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        toast.success('Login successful');
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Do not auto-login: user must sign in explicitly after registration
        toast.success('Account created. Please sign in.');
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setError(null);
    toast.info('Logged out');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const updateProfile = async ({ name, phone, address }) => {
    try {
      setError(null);
      const me = await authAPI.updateProfile({ name, phone, address });
      const u = mapApiUser(me);
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      toast.success('Profile updated');
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Could not update profile';
      setError(msg);
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  /** Refresh user from GET /auth/me (e.g. after deploy or opening profile). */
  const syncUserFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false };
    try {
      const me = await authAPI.getMe();
      const u = mapApiUser(me);
      if (u) {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }, []);

  const deleteAccount = async () => {
    try {
      setError(null);
      await authAPI.deleteAccount();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Your account has been deleted');
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Could not delete account';
      setError(msg);
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  /** After Google redirects back with ?token= — same JWT + user shape as password login. */
  const completeGoogleSignIn = async (token) => {
    try {
      setLoading(true);
      setError(null);
      localStorage.setItem('token', token);
      const me = await authAPI.getMe();
      const u = mapApiUser(me);
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      toast.success('Signed in with Google');
      return { success: true, user: u };
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      const msg =
        (err && typeof err === 'object' && typeof err.message === 'string' && err.message) ||
        (typeof err === 'string' ? err : null) ||
        'Google sign-in failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    completeGoogleSignIn,
    syncUserFromServer,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
