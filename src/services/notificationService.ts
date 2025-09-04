import api from './api';

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: 'NOTICE_CREATED' | 'QUESTION_ASKED' | 'QUESTION_ANSWERED' | 'FILE_UPLOADED';
  referenceId: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  recipientId: string;
  recipientName: string;
}

export interface NotificationSettings {
  settingsId?: number;
  userId: string;
  pushNotificationsEnabled: boolean;
  noticeNotifications: boolean;
  fileNotifications: boolean;
  questionNotifications: boolean;
  answerNotifications: boolean;
}

export interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

class NotificationService {
  private baseURL = '/notifications';

  // Get paginated notifications
  async getNotifications(page: number = 0, size: number = 10): Promise<PaginatedNotifications> {
    const response = await api.get(`${this.baseURL}?page=${page}&size=${size}`);
    return response.data;
  }

  // Get unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get(`${this.baseURL}/unread`);
    return response.data;
  }

  // Get recent notifications (both read and unread) for dropdown
  async getRecentNotifications(limit: number = 5): Promise<Notification[]> {
    const response = await api.get(`${this.baseURL}?page=0&size=${limit}`);
    return response.data.content || response.data;
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await api.get(`${this.baseURL}/unread/count`);
    return response.data.count;
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`${this.baseURL}/${notificationId}/read`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const response = await api.put(`${this.baseURL}/read-all`);
    return response.data;
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get(`${this.baseURL}/settings`);
    return response.data;
  }

  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await api.put(`${this.baseURL}/settings`, settings);
    return response.data;
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'NOTICE_CREATED':
        return '📢';
      case 'QUESTION_ASKED':
        return '❓';
      case 'QUESTION_ANSWERED':
        return '💬';
      case 'FILE_UPLOADED':
        return '📎';
      default:
        return '🔔';
    }
  }

  // Helper method to get notification color based on type
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'NOTICE_CREATED':
        return 'bg-blue-100 text-blue-800';
      case 'QUESTION_ASKED':
        return 'bg-yellow-100 text-yellow-800';
      case 'QUESTION_ANSWERED':
        return 'bg-green-100 text-green-800';
      case 'FILE_UPLOADED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Format notification time
  formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export default new NotificationService();
