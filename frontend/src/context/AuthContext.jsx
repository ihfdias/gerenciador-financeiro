import { useEffect, useState } from 'react';
import api from '../lib/api';
import AuthContext from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = {
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    refreshAuth,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
