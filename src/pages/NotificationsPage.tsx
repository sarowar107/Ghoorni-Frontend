import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../contexts/ToastContext';
import { Bell, Check, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import notificationService, { Notification, PaginatedNotifications } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<PaginatedNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  // Load notifications
  const loadNotifications = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(page, pageSize);
      setNotifications(data);
      setCurrentPage(page);
    } catch (error) {
      showError('Error', 'Failed to load notifications');
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadNotifications(0);
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await notificationService.markAsRead(notificationId);
      await loadNotifications(currentPage); // Refresh current page
      showSuccess('Success', 'Notification marked as read');
    } catch (error) {
      showError('Error', 'Failed to mark notification as read');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(-1); // Use -1 for mark all action
      const result = await notificationService.markAllAsRead();
      await loadNotifications(currentPage); // Refresh current page
      showSuccess('Success', `${result.updatedCount} notifications marked as read`);
    } catch (error) {
      showError('Error', 'Failed to mark all notifications as read');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.notificationId);
        await loadNotifications(currentPage);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case 'NOTICE_CREATED':
        navigate(`/notices/${notification.referenceId}`);
        break;
      case 'QUESTION_ASKED':
      case 'QUESTION_ANSWERED':
        navigate(`/questions/${notification.referenceId}`);
        break;
      case 'FILE_UPLOADED':
        navigate('/files');
        break;
      default:
        break;
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && notifications && newPage < notifications.totalPages) {
      loadNotifications(newPage);
    }
  };

  if (loading && !notifications) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Notifications | Ghoorni</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={24} />
                  Notifications
                </h1>
                {notifications && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {notifications.totalElements} total notifications
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadNotifications(currentPage)}
                  disabled={loading}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                {notifications && notifications.content.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={actionLoading === -1}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCheck size={16} />
                    {actionLoading === -1 ? 'Marking...' : 'Mark All Read'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {!notifications || notifications.content.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any notifications yet. When you receive notifications, they'll appear here.
                </p>
              </div>
            ) : (
              notifications.content.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-lg ${notificationService.getNotificationColor(notification.type)} px-2 py-1 rounded-full text-xs flex-shrink-0`}>
                      {notificationService.getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notificationService.formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.notificationId);
                              }}
                              disabled={actionLoading === notification.notificationId}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                              title="Mark as read"
                            >
                              {actionLoading === notification.notificationId ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {notifications && notifications.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, notifications.totalElements)} of {notifications.totalElements} notifications
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={loading || notifications.first}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage + 1} of {notifications.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={loading || notifications.last}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
