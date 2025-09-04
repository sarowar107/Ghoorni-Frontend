import React, { Fragment } from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import notificationService, { Notification } from '../../services/notificationService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className = '' }) => {
  const { 
    recentNotifications, 
    unreadCount, 
    isLoading, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
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

  return (
    <HeadlessMenu as="div" className={`relative ${className}`}>
      <div>
        <HeadlessMenu.Button className="relative p-2 rounded-full text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </HeadlessMenu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white dark:bg-dark-surface divide-y divide-gray-100 dark:divide-dark-border rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-dark-text-secondary">
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-dark-text-secondary">
                No notifications yet
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <HeadlessMenu.Item key={notification.notificationId}>
                  {({ active }) => (
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className={`${
                        active ? 'bg-gray-50 dark:bg-dark-border' : ''
                      } ${
                        !notification.isRead 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : ''
                      } px-4 py-3 cursor-pointer transition-colors relative`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-lg ${notificationService.getNotificationColor(notification.type)} px-2 py-1 rounded-full text-xs`}>
                          {notificationService.getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-dark-text truncate`}>
                                {notification.title}
                                {!notification.isRead && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                    New
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                {notificationService.formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-dark-text-secondary dark:hover:text-dark-text"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </HeadlessMenu.Item>
              ))
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => navigate('/notifications')}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 w-full text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
};

export default NotificationDropdown;
