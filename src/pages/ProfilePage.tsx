import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Trash2, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Manage Profile | ghoorni</title>
      </Helmet>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Profile</h1>
          <p className="mt-1 text-gray-600 dark:text-dark-text-secondary">
            Update your account settings and personal information.
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User size={22} />
              Profile Information
            </h2>
          </div>
          <form className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user?.avatarUrl}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-cuet-primary-900 text-white rounded-full hover:bg-cuet-primary-800 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{user?.name}</h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">{user?.role}</p>
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Full Name</label>
              <input type="text" id="name" defaultValue={user?.name} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" />
            </div>
            <div className="text-right">
              <button type="submit" className="px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lock size={22} />
              Change Password
            </h2>
          </div>
          <form className="p-6 space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Current Password</label>
              <input type="password" id="current-password" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">New Password</label>
              <input type="password" id="new-password" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" />
            </div>
            <div className="text-right">
              <button type="submit" className="px-4 py-2 bg-cuet-primary-900 text-white font-semibold rounded-lg shadow-md hover:bg-cuet-primary-800 transition-colors">Update Password</button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-800 dark:text-red-300">
              <Trash2 size={22} />
              Danger Zone
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              Deleting your account is a permanent action and cannot be undone.
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">Delete My Account</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
