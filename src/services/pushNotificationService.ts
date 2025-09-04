import { config } from '../config';

class PushNotificationService {
  private vapidPublicKey = config.vapidPublicKey;
  private registration: ServiceWorkerRegistration | null = null;

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      // Check if service workers and push notifications are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return false;
      }

      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize service worker');
        }
      }

      if (!this.registration) {
        throw new Error('Service Worker not registered');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Always unsubscribe first to ensure clean state
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('Existing subscription removed before creating new one');
      }

      // Create new subscription
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        return true; // Already unsubscribed
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Get current subscription
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        await this.initialize();
      }

      if (!this.registration) {
        return null;
      }

      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Check if push notifications are supported and enabled
  async isSupported(): Promise<boolean> {
    return ('serviceWorker' in navigator) && 
           ('PushManager' in window) && 
           ('Notification' in window);
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Show a local notification (for testing)
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/ghoorni-logo.png',
        badge: '/ghoorni-logo.png',
        ...options
      });
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send subscription to server (to be implemented based on your backend)
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
    try {
      // This should send the subscription to your backend
      // The backend will store it and use it to send push notifications
      console.log('Subscription to send to server:', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      });

      // TODO: Implement API call to send subscription to backend
      // const response = await api.post('/api/push-subscriptions', subscriptionData);
      
      return true;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(): Promise<boolean> {
    try {
      // TODO: Implement API call to remove subscription from backend
      // const response = await api.delete('/api/push-subscriptions');
      
      return true;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      return false;
    }
  }
}

export default new PushNotificationService();
