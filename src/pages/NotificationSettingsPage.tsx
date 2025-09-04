import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, BellOff, FileText, MessageSquare, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import notificationService, { NotificationSettings } from '../services/notificationService';
import pushNotificationService from '../services/pushNotificationService';

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

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    >
      <span
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [browserPushSupported, setBrowserPushSupported] = useState(false);
  const [browserPushPermission, setBrowserPushPermission] = useState<NotificationPermission>('default');
  const { showSuccess, showError } = useToast();
  const { pushEnabled, enablePushNotifications, disablePushNotifications } = useNotifications();

  // Load current settings and check browser support
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentSettings = await notificationService.getNotificationSettings();
        setSettings(currentSettings);
        
        // Check browser push notification support
        const isSupported = await pushNotificationService.isSupported();
        setBrowserPushSupported(isSupported);
        
        if (isSupported) {
          setBrowserPushPermission(pushNotificationService.getPermissionStatus());
        }
      } catch (error) {
        showError('Error', 'Failed to load notification settings');
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [showError]);

  // Handle setting change
  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    
    // If enabling/disabling push notifications, handle browser push notifications
    if (key === 'pushNotificationsEnabled') {
      if (value) {
        // Enable browser push notifications
        const success = await enablePushNotifications();
        if (!success) {
          return; // Don't update settings if browser push failed
        }
        // Automatically enable all notification types when push notifications are enabled
        newSettings.noticeNotifications = true;
        newSettings.fileNotifications = true;
        newSettings.questionNotifications = true;
        newSettings.answerNotifications = true;
      } else {
        // Disable browser push notifications and all sub-settings
        await disablePushNotifications();
        newSettings.noticeNotifications = false;
        newSettings.fileNotifications = false;
        newSettings.questionNotifications = false;
        newSettings.answerNotifications = false;
      }
    }
    
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Save settings to server
  const saveSettings = async (settingsToSave: NotificationSettings) => {
    try {
      setSaving(true);
      const updatedSettings = await notificationService.updateNotificationSettings(settingsToSave);
      setSettings(updatedSettings);
      
      const successMsg = 'Notification settings updated successfully';
      setAlert({ type: 'success', message: successMsg });
      showSuccess('Settings Updated', successMsg);
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      const errorMsg = 'Failed to update notification settings';
      setAlert({ type: 'error', message: errorMsg });
      showError('Update Failed', errorMsg);
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Failed to load notification settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Notification Settings | Ghoorni</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your notification preferences for different types of activities
            </p>
          </div>

          <div className="p-6 space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} />}
            
            {/* Push Notifications Master Toggle */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    {settings.pushNotificationsEnabled ? (
                      <Bell size={24} className="text-white" />
                    ) : (
                      <BellOff size={24} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable or disable all push notifications
                    </p>
                    {/* Browser Push Status */}
                    {browserPushSupported && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          pushEnabled ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Browser push: {pushEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}
                    {!browserPushSupported && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Browser push notifications not supported
                      </p>
                    )}
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.pushNotificationsEnabled}
                  onChange={(checked) => handleSettingChange('pushNotificationsEnabled', checked)}
                  disabled={saving || !browserPushSupported}
                />
              </div>
            </div>

            {/* Individual Notification Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Types
              </h3>
              
              {/* Notice Notifications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Notice Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when new notices are posted for you
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.noticeNotifications && settings.pushNotificationsEnabled}
                    onChange={(checked) => handleSettingChange('noticeNotifications', checked)}
                    disabled={saving || !settings.pushNotificationsEnabled}
                  />
                </div>
              </div>

              {/* File Notifications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">File Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when new files are uploaded
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.fileNotifications && settings.pushNotificationsEnabled}
                    onChange={(checked) => handleSettingChange('fileNotifications', checked)}
                    disabled={saving || !settings.pushNotificationsEnabled}
                  />
                </div>
              </div>

              {/* Question Notifications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <HelpCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Question Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when new questions are asked
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.questionNotifications && settings.pushNotificationsEnabled}
                    onChange={(checked) => handleSettingChange('questionNotifications', checked)}
                    disabled={saving || !settings.pushNotificationsEnabled}
                  />
                </div>
              </div>

              {/* Answer Notifications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <MessageSquare size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Answer Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when someone answers your questions
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.answerNotifications && settings.pushNotificationsEnabled}
                    onChange={(checked) => handleSettingChange('answerNotifications', checked)}
                    disabled={saving || !settings.pushNotificationsEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">About Notifications</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    You will receive notifications based on your role and department. Notice notifications are sent when notices are created for your department/batch. Question notifications are sent when questions are asked to your department/batch. Answer notifications are sent when someone answers your questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
