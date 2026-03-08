import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);

  useEffect(() => {
    // Auto-login: if no session exists, create a default local session
    if (!base44.auth.isLoggedIn()) {
      base44.auth.login("utente");
    }
    const currentUser = base44.auth.getUser();
    setUser(currentUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
  }, []);

  const logout = () => {
    base44.auth.logout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      navigateToLogin: logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
