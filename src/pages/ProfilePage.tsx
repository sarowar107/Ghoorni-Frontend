import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Lock, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  return (
    <div className={`p-3 rounded-md ${type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-2`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, updateName, updatePassword, deleteAccount, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // Form states
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [nameAlert, setNameAlert] = useState<AlertProps | null>(null);
  const [passwordAlert, setPasswordAlert] = useState<AlertProps | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Update name when user data changes
  useEffect(() => {
    if (user?.name) {
      setNameValue(user.name);
    }
  }, [user?.name]);
  
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameAlert(null);
    
    if (!nameValue.trim()) {
      const errorMsg = 'Name cannot be empty';
      setNameAlert({ type: 'error', message: errorMsg });
      showError('Invalid Name', errorMsg);
      return;
    }
    
    try {
      await updateName(nameValue);
      const successMsg = 'Name updated successfully';
      setNameAlert({ type: 'success', message: successMsg });
      showSuccess('Name Updated', successMsg);
      setTimeout(() => setNameAlert(null), 3000);
    } catch (error) {
      const errorMsg = 'Failed to update name. Please try again.';
      setNameAlert({ type: 'error', message: errorMsg });
      showError('Update Failed', errorMsg);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAlert(null);
    
    if (!currentPassword || !newPassword) {
      const errorMsg = 'Please fill in both password fields';
      setPasswordAlert({ type: 'error', message: errorMsg });
      showError('Missing Information', errorMsg);
      return;
    }
    
    if (newPassword.length < 6) {
      const errorMsg = 'New password must be at least 6 characters long';
      setPasswordAlert({ type: 'error', message: errorMsg });
      showError('Invalid Password', errorMsg);
      return;
    }
    
    try {
      const success = await updatePassword(currentPassword, newPassword);
      if (success) {
        const successMsg = 'Password updated successfully';
        setPasswordAlert({ type: 'success', message: successMsg });
        showSuccess('Password Changed', successMsg);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordAlert(null), 3000);
      } else {
        const errorMsg = 'Current password is incorrect';
        setPasswordAlert({ type: 'error', message: errorMsg });
        showError('Password Change Failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Failed to update password. Please try again.';
      setPasswordAlert({ type: 'error', message: errorMsg });
      showError('Password Change Failed', errorMsg);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirm) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (error) {
        alert('Failed to delete account. Please try again.');
      }
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Manage Profile | Ghoorni</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update your account information and settings</p>
          </div>

          <div className="p-6 space-y-8">
            {/* User Info Section */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center space-x-6">
                {/* Default Avatar */}
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>Department: {user.deptName}</span>
                    {user.batch && <span>Batch: {user.batch}</span>}
                    <span>Role: {user.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Name Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <User className="mr-3 text-blue-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Name</h2>
              </div>
              
              {nameAlert && <Alert type={nameAlert.type} message={nameAlert.message} />}
              
              <form onSubmit={handleNameSubmit} className="mt-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Name'}
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Lock className="mr-3 text-blue-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
              </div>
              
              {passwordAlert && <Alert type={passwordAlert.type} message={passwordAlert.message} />}
              
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Trash2 className="mr-3 text-red-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
              
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  deleteConfirm 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300'
                } disabled:opacity-50`}
              >
                {loading ? 'Deleting...' : deleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
              </button>
              
              {deleteConfirm && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  Click again to confirm account deletion. This action cannot be undone.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;