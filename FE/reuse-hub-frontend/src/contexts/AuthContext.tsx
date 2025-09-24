import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User, SignInRequest, UserCreationRequest, UserCreationResponse, VerifyEmailResponse, SignInResponse } from '../types/api';
import { USER_STATUS } from '../types/constants';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: SignInRequest) => Promise<void>;
  register: (userData: UserCreationRequest) => Promise<UserCreationResponse>;
  verifyEmail: (userId: string, verificationCode: string) => Promise<VerifyEmailResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!accessToken && !!user && user.status === USER_STATUS.ACTIVE; // Check user status too

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');

    if (savedAccessToken && savedRefreshToken && savedUser) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (credentials: SignInRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(credentials);
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      
      // Save to localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('Login successful:', response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserCreationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(errorMessage);
      console.error('Registration error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (userId: string, verificationCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.verifyEmail(userId, verificationCode);
      console.log('Email verification successful:', response);
      // Update user status in context/local storage if needed
      if (user && response.id === user.id) {
        setUser(prev => prev ? { ...prev, status: response.status } : null);
        localStorage.setItem('user', JSON.stringify({ ...user, status: response.status }));
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Xác minh email thất bại';
      setError(errorMessage);
      console.error('Email verification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (refreshToken) {
        // await apiService.logout(refreshToken); // Uncomment when logout API is ready
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken,
      isLoading,
      isAuthenticated,
      login,
      register,
      verifyEmail,
      logout,
      clearError,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
