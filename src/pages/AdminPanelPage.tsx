import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UserCog, Trash2, Loader, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanelPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: users = [], isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    enabled: !!user && user.role === 'admin', // Only fetch if user is admin
  });

  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
          <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">
            Manage users, roles, and system settings.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-dark-border">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCog size={24} />
              User Management
            </h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center p-8">
                <Loader size={40} className="mx-auto text-gray-400 animate-spin" />
                <p className="mt-2 text-gray-500">Loading users...</p>
              </div>
            ) : isError ? (
              <div className="text-center p-8">
                <AlertCircle size={40} className="mx-auto text-red-500" />
                <p className="mt-2 text-red-600">{error?.message || 'Failed to load users'}</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-dark-border/50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">User ID</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Email</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Role</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Department</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Batch</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                        <td className="p-4 font-mono text-sm text-gray-600 dark:text-dark-text-secondary">{user.userId}</td>
                        <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{user.name}</td>
                        <td className="p-4 text-gray-600 dark:text-dark-text-secondary">{user.email}</td>
                        <td className="p-4"><RolePill role={user.role} /></td>
                        <td className="p-4 text-gray-600 dark:text-dark-text-secondary">{user.deptName}</td>
                        <td className="p-4 text-gray-600 dark:text-dark-text-secondary">{user.batch}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteUser(user.userId)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-dark-text-secondary">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface RolePillProps {
  role: string;
}

const RolePill: React.FC<RolePillProps> = ({ role }) => {
  const styles: Record<string, string> = {
    student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    cr: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    teacher: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[role.toLowerCase()]}`}>{role.toUpperCase()}</span>;
};

export default AdminPanelPage;
