import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => {
        setUser(null);
        window.location.href = '/login';
      });
  };

  const login = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
