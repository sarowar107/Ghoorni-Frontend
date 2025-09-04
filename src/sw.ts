/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// This will be injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || []);

// Install event
self.addEventListener('install', () => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event: PushEvent) => {
  console.log('Service Worker: Push event received');
  
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/ghoorni-logo.png',
    badge: '/ghoorni-logo.png',
    tag: 'ghoorni-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/ghoorni-logo.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/ghoorni-logo.png'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline notifications (optional)
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'background-sync-notifications') {
    console.log('Service Worker: Background sync for notifications');
  }
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
