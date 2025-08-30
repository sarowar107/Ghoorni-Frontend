import api from './api';

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
  login: async (credentials: LoginCredentials) => {
    // Clear any existing token first
    localStorage.removeItem('auth_token');
    
    try {
      console.log(`Logging in with user ID: ${credentials.userId}`);
      const response = await api.post('/auth/login', credentials);
      const token = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Save the token with userId to ensure we know who we're logged in as
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user_id', credentials.userId);
      console.log(`Auth token saved for user ${credentials.userId}, token length: ${token.length}`);
      
      // Update authorization headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Validate the token immediately after login
      await api.get('/auth/validate');
      
      return token;
    } catch (error: any) {
      console.error('Login API error:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  // User signup
  signup: async (userData: SignupData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Fetching current user with token:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      if (!token) {
        console.log('No token found, cannot fetch user');
        return null;
      }
      
      // Force token refresh in request headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.data) {
        console.error('Empty response data from /auth/me');
        return null;
      }
      
      const userData = response.data;
      console.log('Retrieved user data:', JSON.stringify(userData));
      console.log('User details - Name:', userData.name, 'Role:', userData.role, 'ID:', userData.userId);
      

      
      return userData;
    } catch (error: any) {
      console.error('Failed to get current user:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      // Remove token if there's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
        console.log('Removing token due to auth error');
        localStorage.removeItem('auth_token');
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
};

export default authService;
