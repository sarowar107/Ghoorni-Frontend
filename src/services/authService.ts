import api from './api';

export interface LoginResponse {
  token: string | null;
  needsEmailVerification: boolean;
  errorMessage: string | null;
}

export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface SignupData {
  userId: string;
  name: string;
  email: string;
  password: string;
  deptName: string;
  batch: string | null;
  role: string;
}



export interface UpdateNameRequest {
  name: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const authService = {
  // User login
  login: async ({ userId, password }: LoginCredentials) => {
    // Clear any existing token first
    localStorage.removeItem('auth_token');
    
    try {
      const response = await api.post('/auth/login', { userId, password });
      
      if (response.data.errorMessage) {
        throw { 
          response: { 
            data: response.data.errorMessage,
            status: response.status
          } 
        };
      }

      // Email verification check disabled
      /* if (response.data.needsEmailVerification) {
        throw { 
          response: { 
            data: 'Please verify your email to continue',
            needsEmailVerification: true,
            userId: userId
          } 
        };
      } */
      
      const token = response.data.token;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Save the token with userId to ensure we know who we're logged in as
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user_id', userId);
      
      // Update authorization headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get user details including email verification status
      const userResponse = await api.get('/auth/me');
      return userResponse.data;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      
      // Ensure we always throw a structured error with proper message extraction
      if (error.response) {
        // Server responded with error status
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.errorMessage) {
            errorMessage = error.response.data.errorMessage;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        throw {
          response: {
            data: {
              errorMessage: errorMessage
            },
            status: error.response.status
          }
        };
      } else if (error.request) {
        // Network error
        throw {
          response: {
            data: {
              errorMessage: 'Network error. Please check your connection and try again.'
            },
            status: 0
          }
        };
      } else {
        // Other error
        throw {
          response: {
            data: {
              errorMessage: error.message || 'An unexpected error occurred during login.'
            },
            status: 0
          }
        };
      }
    }
  },

  // User signup
  signup: async (userData: SignupData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      console.error('Signup failed:', error.response?.data || error.message);
      
      // Ensure we always throw a structured error
      if (error.response) {
        // Server responded with error status
        throw {
          response: {
            data: error.response.data || 'Registration failed. Please try again.',
            status: error.response.status
          }
        };
      } else if (error.request) {
        // Network error
        throw {
          response: {
            data: 'Network error. Please check your connection and try again.',
            status: 0
          }
        };
      } else {
        // Other error
        throw {
          response: {
            data: error.message || 'An unexpected error occurred. Please try again.',
            status: 0
          }
        };
      }
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return null;
      }
      
      const response = await api.get('/auth/me');
      
      if (!response.data) {
        console.error('Empty response data from /auth/me');
        return null;
      }
      
      const userData = response.data;
      console.log('User authenticated:', userData.name, '(' + userData.role + ')');
      
      return userData;
    } catch (error: any) {
      console.error('Failed to get current user:', error.response?.status || error.message);
      
      // Remove token if there's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user_id');
      }
      return null;
    }
  },

  // Logout - clear localStorage and all auth data
  logout: () => {
    console.log('Logging out user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    // Clear the Authorization header
    delete api.defaults.headers.common['Authorization'];
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('auth_token');
  },



  // Update user name
  updateName: async (name: string) => {
    try {
      const response = await api.put('/user/name', { name });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update name:', error.message);
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/user/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update password:', error.message);
      throw error;
    }
  },



  // Delete account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/user/account');
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete account:', error.message);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async (userId: string) => {
    const response = await api.post('/auth/resend-verification', null, {
      params: { userId }
    });
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }
};

export default authService;
