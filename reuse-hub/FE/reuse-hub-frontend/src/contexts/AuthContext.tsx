import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User, SignInRequest, UserCreationRequest, UserCreationResponse, VerifyEmailResponse } from '../types/api';
import { USER_STATUS } from '../types/constants';
import { getWalletBalance } from '../api/profile';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletBalance: number;
  refreshWallet: () => Promise<void>;
  login: (credentials: SignInRequest) => Promise<void>;
  register: (userData: UserCreationRequest) => Promise<UserCreationResponse>;
  verifyEmail: (userId: string, verificationCode: string) => Promise<VerifyEmailResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage immediately
  const initializeState = () => {
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');
    
    let initialUser = null;
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // If no id, try to extract from token
        if (!parsedUser.id && savedAccessToken) {
          try {
            const tokenParts = savedAccessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const extractedId = payload.sub || payload.userId || payload.id;
              if (extractedId) {
                parsedUser.id = extractedId;
              }
            }
          } catch (e) {
            console.error('Error extracting userId from token:', e);
          }
        }
        
        // Set status if missing
        if (!parsedUser.status) {
          parsedUser.status = USER_STATUS.ACTIVE;
        }
        
        initialUser = parsedUser;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    return {
      accessToken: savedAccessToken,
      refreshToken: savedRefreshToken,
      user: initialUser,
    };
  };
  
  // Lazy initialization - only run once on mount
  const [user, setUser] = useState<User | null>(() => initializeState().user);
  const [accessToken, setAccessToken] = useState<string | null>(() => initializeState().accessToken);
  const [refreshToken, setRefreshToken] = useState<string | null>(() => initializeState().refreshToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  console.log('AuthContext initialized - accessToken:', !!accessToken, 'user:', user);

  // Make authentication check more lenient - if we have a token and user, allow access
  const isAuthenticated = !!accessToken && !!user; // Simplified - just check if we have token and user

  // Fetch wallet balance when user logs in
  const refreshWallet = async () => {
    if (user?.id) {
      try {
        const response = await getWalletBalance(user.id);
        if (response.status === 200 && response.data !== undefined) {
          setWalletBalance(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshWallet();
    }
  }, [isAuthenticated, user?.id]);

  const login = async (credentials: SignInRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(credentials);
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      
      // Use userId from response (this should be the UUID)
      let userId = response.userId;
      console.log('Response userId:', userId);
      
      // Fallback: Extract userId from JWT token only if response.userId is missing
      if (!userId && response.accessToken) {
        try {
          const tokenParts = response.accessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Payload:', payload);
            // Only use sub if it looks like a UUID (contains dashes), otherwise use userId or id
            if (payload.userId) {
              userId = payload.userId;
            } else if (payload.id) {
              userId = payload.id;
            } else if (payload.sub && payload.sub.includes('-')) {
              userId = payload.sub;
            }
          }
        } catch (e) {
          console.error('Error extracting userId from token:', e);
        }
      }
      
      console.log('Final userId:', userId);
      
      // Create user object from response
      const user: User = {
        id: userId || '',
        email: credentials.usernameOrEmail.includes('@') ? credentials.usernameOrEmail : '',
        username: credentials.usernameOrEmail.includes('@') ? '' : credentials.usernameOrEmail,
        status: USER_STATUS.ACTIVE
      };
      
      setUser(user);
      
      // Save to localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login successful:', user);
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
        setUser(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
        localStorage.setItem('user', JSON.stringify({ ...user, status: 'ACTIVE' }));
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
      walletBalance,
      refreshWallet,
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
