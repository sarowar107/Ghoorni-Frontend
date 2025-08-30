import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UserCog, ShieldCheck, Trash2, Edit } from 'lucide-react';

type UserRole = 'STUDENT' | 'CR' | 'TEACHER' | 'ADMIN';
type UserStatus = 'Active' | 'Suspended' | 'Pending Verification';

interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

// Mock Data
const mockUsers: User[] = [
  { id: '1804116', name: 'John Doe', role: 'STUDENT', status: 'Active' },
  { id: '1804117', name: 'Jane Smith', role: 'CR', status: 'Active' },
  { id: 'T-001', name: 'Dr. Alan Grant', role: 'TEACHER', status: 'Active' },
  { id: '1804119', name: 'Peter Jones', role: 'STUDENT', status: 'Suspended' },
  { id: '1804120', name: 'Mary Jane', role: 'CR', status: 'Pending Verification' },
];

const AdminPanelPage: React.FC = () => {
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
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-dark-border/50">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">User ID</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Name</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Role</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {mockUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-dark-text-secondary">{user.id}</td>
                    <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{user.name}</td>
                    <td className="p-4"><RolePill role={user.role} /></td>
                    <td className="p-4"><StatusPill status={user.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.status === 'Pending Verification' && (
                          <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full transition-colors">
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

interface RolePillProps {
  role: UserRole;
}

const RolePill: React.FC<RolePillProps> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    STUDENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    CR: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    TEACHER: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[role]}`}>{role}</span>;
};

interface StatusPillProps {
  status: UserStatus;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const styles: Record<UserStatus, string> = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Suspended: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Pending Verification': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default AdminPanelPage;
