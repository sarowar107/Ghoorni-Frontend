import React, { Fragment } from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
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
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();

  const handleMarkAllAsRead = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await markAllAsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    // The menu will close automatically from Headless UI
    // Mark as read optimistically
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    // Navigate to the relevant page
    switch (notification.type) {
      case 'NOTICE_CREATED':
        navigate(`/notices/${notification.referenceId}`);
        break;
      case 'QUESTION_ASKED':
      case 'QUESTION_ANSWERED':
        navigate(`/q-a/${notification.referenceId}`);
        break;
      case 'FILE_UPLOADED':
        navigate('/files');
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="px-4 py-10 text-center text-gray-500 dark:text-dark-text-secondary">
          <p>Loading notifications...</p>
        </div>
      );
    }

    if (recentNotifications.length === 0) {
      return (
        <div className="px-4 py-10 text-center text-gray-500 dark:text-dark-text-secondary flex flex-col items-center gap-4">
          <Inbox size={32} className="text-gray-400 dark:text-dark-border" />
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-dark-text">All caught up!</h4>
            <p className="text-sm">You have no new notifications.</p>
          </div>
        </div>
      );
    }

    return recentNotifications.map((notification) => (
      <HeadlessMenu.Item key={notification.notificationId}>
        {({ active }) => (
          <div
            onClick={() => handleNotificationClick(notification)}
            className={`
              w-full text-left p-4 cursor-pointer transition-colors
              ${active ? 'bg-gray-50 dark:bg-dark-border' : ''}
              ${!notification.isRead ? 'bg-cuet-primary-50/50 dark:bg-cuet-primary-900/10' : ''}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-dark-border">
                {notificationService.getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-dark-text`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                  {notificationService.formatNotificationTime(notification.createdAt)}
                </p>
              </div>
              <div className="flex-shrink-0 self-center">
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 bg-cuet-primary-600 rounded-full" title="Unread"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </HeadlessMenu.Item>
    ));
  };

  return (
    <HeadlessMenu as="div" className={`relative ${className}`}>
      <div>
        <HeadlessMenu.Button className="relative p-2 rounded-full text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cuet-secondary-600 text-white text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-dark-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
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
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-96 origin-top-right bg-white dark:bg-dark-surface divide-y divide-gray-100 dark:divide-dark-border rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          <header className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-cuet-primary-700 hover:text-cuet-primary-900 dark:text-cuet-primary-400 dark:hover:text-cuet-primary-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              )}
            </div>
          </header>

          <main className="max-h-[60vh] overflow-y-auto">
            {renderContent()}
          </main>

          {recentNotifications.length > 0 && (
             <footer className="p-2">
              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/notifications')}
                    className={`
                      text-sm font-semibold text-cuet-primary-700 dark:text-cuet-primary-400 
                      w-full text-center rounded-lg py-2 transition-colors 
                      ${active ? 'bg-gray-100 dark:bg-dark-border' : ''}
                    `}
                  >
                    View all notifications
                  </button>
                )}
              </HeadlessMenu.Item>
            </footer>
          )}
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
};

export default NotificationDropdown;
