import api from './api';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  deptName: string;
  batch: string;
  createdAt: string;
  updatedAt: string;
}

const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    
    // Handle different response types from backend
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      // If response is not an array (likely an error message), throw an error
      throw new Error(typeof response.data === 'string' ? response.data : 'Failed to fetch users');
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Update user role
  updateUserRole: async (userId: string, newRole: string): Promise<User> => {
    const response = await api.put(`/users/${userId}/role`, { role: newRole });
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, newStatus: string): Promise<User> => {
    const response = await api.put(`/users/${userId}/status`, { status: newStatus });
    return response.data;
  }
};

export default userService;
