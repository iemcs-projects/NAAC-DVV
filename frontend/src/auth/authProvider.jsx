// src/auth/authProvider.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

// Simplified and more reliable role checking
const hasRole = (user, requiredRole) => {
  if (!user?.role) return false;
  
  const userRoles = Array.isArray(user.role) 
    ? user.role.map(r => r.toLowerCase()) 
    : [user.role.toLowerCase()];
    
  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole.map(r => r.toLowerCase())
    : [requiredRole.toLowerCase()];
    
  return requiredRoles.some(reqRole => userRoles.includes(reqRole));
};

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  hasRole: () => false,
  checkAuth: () => Promise.resolve(false),
  login: () => Promise.resolve({ success: false }),
  logout: () => Promise.resolve(),
  clearError: () => {},
  initialized: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const setUserData = useCallback((userData) => {
    setUser(userData);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      
      if (response.data?.success && response.data.data?.user) {
        setUserData(response.data.data.user);
        return true;
      }
      
      setUser(null);
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setError('Authentication check failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUserData]);

  const refreshTokens = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      
      if (response.data?.success) {
        // Re-check auth after successful refresh
        return await checkAuth();
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  }, [checkAuth]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Try to authenticate with existing tokens
      const authenticated = await checkAuth();
      
      // If auth failed, try to refresh tokens
      if (!authenticated) {
        await refreshTokens();
      }
      
      setInitialized(true);
      setLoading(false);
    };

    initAuth();
  }, [checkAuth, refreshTokens]);

  const login = useCallback(async (email, password, role) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/userLogin', { 
        email, 
        password, 
        role: role.toLowerCase() 
      });
      
      if (response.data?.data?.user) {
        setUserData(response.data.data.user);
        return { 
          success: true, 
          user: response.data.data.user,
          message: response.data.message 
        };
      }
      
      const errorMsg = response.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
      
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Login error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [setUserData]);

  const setUserAfterRegistration = useCallback((userData) => {
    // Normalize the user data structure
    const normalizedUser = {
      id: userData.id || userData.uuid,
      uuid: userData.uuid,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'iqac',
      institution_name: userData.institution_name,
      ...userData
    };
    
    setUserData(normalizedUser);
    return true;
  }, [setUserData]);

  const logout = useCallback(async (redirectCallback) => {
    try {
      setLoading(true);
      
      // Call logout API
      await api.post('/auth/logout');
      console.log('Logout API call successful');
      
    } catch (error) {
      console.error('Logout API error:', error?.response?.data || error.message);
      // Continue with logout even if API fails
    } finally {
      // Always clear state regardless of API success/failure
      setUser(null);
      setError(null);
      setLoading(false);
      
      // Clear any client-side storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Storage clearing failed:', storageError);
      }
      
      // Call redirect callback if provided
      if (typeof redirectCallback === 'function') {
        redirectCallback();
      }
    }
  }, []);

  const contextValue = {
    isAuthenticated: !!user,
    user,
    loading,
    error,
    hasRole: (role) => hasRole(user, role),
    checkAuth,
    login,
    logout,
    setUserAfterRegistration,
    clearError,
    initialized
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};