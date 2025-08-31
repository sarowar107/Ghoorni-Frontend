import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import authService from '../services/authService';

type UserRole = 'student' | 'cr' | 'teacher' | 'admin';

export interface User {
  userId: string;
  name: string;
  email: string;
  deptName: string;
  batch: string | null;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userId: string, password: string) => Promise<User>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateName: (name: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // Only try to fetch current user if we have a token
        const token = localStorage.getItem('auth_token');
        const savedUserId = localStorage.getItem('auth_user_id');
        
        if (token && savedUserId) {
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            // Verify user ID matches what we expect
            if (savedUserId && currentUser.userId !== savedUserId) {
              console.error(`User ID mismatch! Expected: ${savedUserId}, Got: ${currentUser.userId}`);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user_id');
              setUser(null);
            } else {
              setUser(currentUser);
            }
          } else {
            // If we get no user but had a token, clear the token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user_id');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If there's an error, clear any existing token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user_id');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userId: string, password: string) => {
    setLoading(true);
    try {
      // Clear existing user data and local storage
      setUser(null);
      localStorage.removeItem('auth_token');
      
      // Attempt login to get token and user data
      const userData = await authService.login({ userId, password });
      
      // At this point, if we get userData back, it means the login was successful
      // and email was verified (the service throws for unverified email)
      if (!userData) {
        throw new Error('Failed to retrieve user data');
      }
      
      // Double check the token was saved
      if (!localStorage.getItem('auth_token')) {
        throw new Error('Authentication failed: Token not saved');
      }
      
      if (userData.userId !== userId) {
        console.error(`User ID mismatch! Expected: ${userId}, Got: ${userData.userId}`);
        localStorage.removeItem('auth_token');
        throw new Error('User ID mismatch in authentication');
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('auth_token'); // Clear token on any error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }) => {
    setLoading(true);
    try {
      await authService.signup(userData as any);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  // Add new profile functions
  const refreshUserData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateName = async (name: string) => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    try {
      await authService.updateName(name);
      setUser((prev) => prev ? { ...prev, name } : null);
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  

  
  const deleteAccount = async () => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    try {
      await authService.deleteAccount();
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      updateName,
      updatePassword,
      deleteAccount,
      refreshUserData
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
