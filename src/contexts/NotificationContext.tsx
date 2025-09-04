import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notificationService, { Notification } from '../services/notificationService';
import pushNotificationService from '../services/pushNotificationService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  recentNotifications: Notification[];
  isLoading: boolean;
  pushEnabled: boolean;
  refreshNotifications: () => Promise<void>;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<boolean>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  // Initialize notifications and push service
  useEffect(() => {
    if (user) {
      initializeNotifications();
      initializePushNotifications();
      
      // Set up periodic refresh (every 30 seconds)
      const interval = setInterval(refreshNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const initializeNotifications = async () => {
    await refreshNotifications();
  };

  const initializePushNotifications = async () => {
    try {
      const isSupported = await pushNotificationService.isSupported();
      if (isSupported) {
        await pushNotificationService.initialize();
        const subscription = await pushNotificationService.getSubscription();
        setPushEnabled(!!subscription);
        console.log('Push notifications initialized. Enabled:', !!subscription);
      } else {
        console.log('Push notifications not supported');
        setPushEnabled(false);
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setPushEnabled(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [unreadNotifications, recentNotifs, count] = await Promise.all([
        notificationService.getUnreadNotifications(),
        notificationService.getRecentNotifications(3), // Limit to 3 recent notifications
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(unreadNotifications);
      setRecentNotifications(recentNotifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      console.log('Attempting to enable push notifications...');
      
      const isSupported = await pushNotificationService.isSupported();
      if (!isSupported) {
        showError('Error', 'Push notifications are not supported in this browser');
        return false;
      }

      const permission = await pushNotificationService.requestPermission();
      if (permission !== 'granted') {
        showError('Error', 'Push notification permission was denied. Please enable notifications in your browser settings.');
        return false;
      }

      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        console.log('Push subscription created successfully');
        const success = await pushNotificationService.sendSubscriptionToServer(subscription);
        if (success) {
          setPushEnabled(true);
          showSuccess('Push Notifications', 'Push notifications enabled successfully');
          return true;
        } else {
          showError('Error', 'Failed to register push notifications on server');
          return false;
        }
      } else {
        showError('Error', 'Failed to create push notification subscription');
        return false;
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable push notifications';
      showError('Error', errorMessage);
      return false;
    }
  };

  const disablePushNotifications = async (): Promise<boolean> => {
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        await pushNotificationService.removeSubscriptionFromServer();
        setPushEnabled(false);
        showSuccess('Push Notifications', 'Push notifications disabled successfully');
        return true;
      } else {
        showError('Error', 'Failed to disable push notifications');
        return false;
      }
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      showError('Error', 'Failed to disable push notifications');
      return false;
    }
  };

  const markAsRead = async (notificationId: number) => {
    const notificationToUpdate = recentNotifications.find(n => n.notificationId === notificationId);
    if (!notificationToUpdate || notificationToUpdate.isRead) {
      return; // Already read or not found, no action needed
    }

    const originalRecent = [...recentNotifications];
    const originalCount = unreadCount;

    // Optimistic UI update for instant feedback
    setRecentNotifications(prev => 
      prev.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      // Perform API call in the background
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showError('Error', 'Failed to mark notification as read');
      // Rollback UI on failure
      setRecentNotifications(originalRecent);
      setUnreadCount(originalCount);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      await refreshNotifications();
      showSuccess('Success', `${result.updatedCount} notifications marked as read`);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showError('Error', 'Failed to mark all notifications as read');
    }
  };

  const value: NotificationContextType = {
    unreadCount,
    notifications,
    recentNotifications,
    isLoading,
    pushEnabled,
    refreshNotifications,
    enablePushNotifications,
    disablePushNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
