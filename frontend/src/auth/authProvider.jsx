// src/auth/authProvider.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contextprovider/appContext';

const hasRole = (user, requiredRole) => {
  if (!user || (!user.role && !user.roles)) return false;

  const userRoles = Array.isArray(user.roles || user.role)
    ? (user.roles || user.role).map(r => String(r).toLowerCase())
    : [String(user.role).toLowerCase()];

  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole.map(r => String(r).toLowerCase())
    : [String(requiredRole).toLowerCase()];

  return userRoles.some(userRole =>
    requiredRoles.some(reqRole =>
      userRole === reqRole || userRole.includes(reqRole) || reqRole.includes(userRole)
    )
  );
};

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  hasRole,
  checkAuth: () => Promise.resolve(false),
  login: () => Promise.resolve({ success: false }),
  logout: () => Promise.resolve(),
  initialized: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const { setIsLoggedIn } = useContext(AppContext);

  const setUserAndLogin = useCallback((userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data.data?.user) {
        setUserAndLogin(response.data.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setUserAndLogin]);

  const refreshTokens = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      if (res.data?.success) {
        return await checkAuth(); // re-fetch user
      }
      return false;
    } catch {
      return false;
    }
  }, [checkAuth]);

  useEffect(() => {
    const init = async () => {
      const authed = await checkAuth();
      if (!authed) await refreshTokens();
      setInitialized(true);
    };
    init();
  }, [checkAuth, refreshTokens]);

  const login = useCallback(async (email, password, role) => {
    try {
      const res = await api.post('/auth/userLogin', { email, password, role: role.toLowerCase() });
      if (res.data?.data?.user) {
        setUserAndLogin(res.data.data.user);
        return { success: true, user: res.data.data.user };
      }
      return { success: false, error: res.data?.message || 'Login failed' };
    } catch (err) {
      return { success: false, error: err?.response?.data?.message || 'Login error' };
    }
  }, [setUserAndLogin]);

  const setUserAfterRegistration = useCallback((iqacData) => {
    setUserAndLogin({
      id: iqacData.id,
      name: iqacData.name,
      email: iqacData.email,
      role: 'iqac',
      institution_name: iqacData.institution_name
    });
    return true;
  }, [setUserAndLogin]);

  const logout = useCallback(async () => {
    try {
      console.log("Calling /auth/logout API");
  
      const response = await api.post('/auth/logout');
      console.log("Logout API response:", response.data);
  
    } catch (error) {
      console.error('Logout error:', error?.response?.data || error.message);
    } finally {
      // Clear frontend state
      setUser(null);
      setIsLoggedIn(false);
  
      // Clear frontend storage
      localStorage.clear();
      sessionStorage.clear();
  
      // Optional: Clear non-HttpOnly cookies (won’t affect accessToken if HttpOnly)
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
  
      // Redirect to login
      window.location.href = '/login';
    }
  }, [setIsLoggedIn]);
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      hasRole: (role) => hasRole(user, role),
      checkAuth,
      login,
      logout,
      setUserAfterRegistration,
      initialized
    }}>
      {initialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
