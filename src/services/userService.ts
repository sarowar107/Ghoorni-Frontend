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
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
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
