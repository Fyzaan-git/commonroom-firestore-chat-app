import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi, getStoredUser, setStoredAuth } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = getStoredUser();
        if (stored) {
          const fresh = await authApi.me();
          setUser(fresh);
          setStoredAuth(null, fresh);
        } else {
          // Auto-sign in default demo user for instant interactive workspace
          const res = await authApi.login({
            email: 'alex.mercer@commonroom.io',
            password: 'demo',
          });
          setUser(res.user);
          setStoredAuth(res.token, res.user);
        }
      } catch (err) {
        console.warn('Initial session check error', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    setStoredAuth(res.token, res.user);
    return res.user;
  };

  const register = async (displayName, email, password, photoURL) => {
    const res = await authApi.register({ displayName, email, password, photoURL });
    setUser(res.user);
    setStoredAuth(res.token, res.user);
    return res.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await usersApi.updateProfile(updates);
    setUser(updated);
    setStoredAuth(null, updated);
    return updated;
  };

  const forgotPassword = async (email) => {
    return await authApi.forgotPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
