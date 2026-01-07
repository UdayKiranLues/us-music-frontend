import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Add response interceptor to handle auth errors globally
let isInterceptorSet = false;

const setupInterceptor = (logoutCallback) => {
  if (isInterceptorSet) return;
  
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If we get 401 on /auth/me during init, don't logout (user wasn't logged in)
      if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
        console.warn('⚠️ 401 Unauthorized - Session may have expired');
        // Only auto-logout if it's not the initial /auth/me check
        if (!error.config.url?.includes('/auth/me') || logoutCallback) {
          // Don't call logout here to avoid infinite loops
        }
      }
      return Promise.reject(error);
    }
  );
  
  isInterceptorSet = true;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor
  useEffect(() => {
    setupInterceptor();
  }, []);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');

      // Only try to verify if we have stored user info (means user was logged in)
      if (storedUser) {
        try {
          console.log('🔍 Verifying authentication with /auth/me...');
          // Call /auth/me - backend will check cookie
          const response = await axios.get(`${API_URL}/api/v1/auth/me`);
          
          console.log('✅ Authentication verified:', response.data.data);
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.warn('❌ Auth verification failed (likely logged out or expired):', error.response?.status);
          // Don't crash - just clear stale localStorage
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      const { user: userData } = response.data.data;

      console.log('✅ Login successful, cookie set by backend');

      // Store user info in localStorage (token is in HTTP-only cookie)
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      console.log('📝 Registering new user:', userData.email);
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, userData);

      const { user: newUser } = response.data.data;

      console.log('✅ Registration successful, cookie set by backend');

      // Store user info in localStorage (token is in HTTP-only cookie)
      localStorage.setItem('user', JSON.stringify(newUser));

      // Update state
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call backend logout to clear cookies
      await axios.post(`${API_URL}/api/v1/auth/logout`);
    } catch (error) {
      console.warn('⚠️ Logout API call failed, clearing local state anyway');
    }

    // Clear localStorage
    localStorage.removeItem('user');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('🚪 Logged out successfully');
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/auth/profile`, updates);

      const updatedUser = response.data.data;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Update failed',
      };
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (requiredRole) => {
    if (!user || !requiredRole) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Check exact role match
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Check if user is artist
   */
  const isArtist = () => {
    return user?.role === 'artist' || user?.role === 'admin';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isArtist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
