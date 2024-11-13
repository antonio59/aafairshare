import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { Bell, BellOff, AlertCircle, Calendar, PieChart, XCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import type { NotificationPreferences, TimedNotificationSetting, ChanneledNotificationSetting, BudgetNotificationSetting } from '../../types';

type NotificationKey = keyof NotificationPreferences;

interface NotificationSetting {
  key: NotificationKey;
  label: string;
  description: string;
  icon: JSX.Element;
  hasTime?: boolean;
  hasChannels?: boolean;
}

const isTimedNotification = (key: NotificationKey): key is 'monthlyReminder' | 'monthEndReminder' | 'monthlyAnalytics' => {
  return ['monthlyReminder', 'monthEndReminder', 'monthlyAnalytics'].includes(key);
};

const isChanneledNotification = (key: NotificationKey): key is 'settlementNotifications' => {
  return key === 'settlementNotifications';
};

const isBudgetNotification = (key: NotificationKey): key is 'overBudget' => {
  return key === 'overBudget';
};

const NotificationsSettings = () => {
  const { currentUser, updateUser } = useUserStore();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  if (!currentUser) return null;

  const handleToggle = async (key: NotificationKey, subKey: string = 'enabled') => {
    if (!currentUser) return;

    // If enabling any notification and permission is not granted
    if (permissionStatus !== 'granted') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission !== 'granted') {
          setShowPermissionAlert(true);
          return;
        }
      }
    }

    const notifications = { ...currentUser.preferences.notifications };

    if (isChanneledNotification(key)) {
      const setting = { ...notifications[key] };
      if (subKey === 'enabled' || subKey === 'inAppEnabled' || subKey === 'emailEnabled') {
        setting[subKey] = !setting[subKey];
      }
      notifications[key] = setting;
    } else if (isTimedNotification(key)) {
      const setting = { ...notifications[key] };
      if (subKey === 'enabled') {
        setting.enabled = !setting.enabled;
      }
      notifications[key] = setting;
    } else if (isBudgetNotification(key)) {
      const setting = { ...notifications[key] };
      if (subKey === 'enabled') {
        setting.enabled = !setting.enabled;
      }
      notifications[key] = setting;
    }

    updateUser({
      preferences: {
        ...currentUser.preferences,
        notifications
      }
    });
  };

  const handleTimeChange = (key: NotificationKey, time: string) => {
    if (!currentUser || !isTimedNotification(key)) return;

    const notifications = { ...currentUser.preferences.notifications };
    const setting = { ...notifications[key], time };
    notifications[key] = setting;

    updateUser({
      preferences: {
        ...currentUser.preferences,
        notifications
      }
    });
  };

  const notifications: NotificationSetting[] = [
    {
      key: 'overBudget',
      label: 'Over Budget Alerts',
      description: 'Get notified when you exceed your budget limits',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      hasTime: false
    },
    {
      key: 'monthlyReminder',
      label: 'Monthly Reminders',
      description: 'Receive reminders to add your expenses at the start of each month',
      icon: <Bell className="w-5 h-5 text-blue-500" />,
      hasTime: true
    },
    {
      key: 'monthEndReminder',
      label: 'Month End Reminders',
      description: 'Get notified when it\'s time to settle expenses at month end',
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      hasTime: true
    },
    {
      key: 'monthlyAnalytics',
      label: 'Monthly Analytics',
      description: 'Receive monthly spending analysis reports',
      icon: <PieChart className="w-5 h-5 text-purple-500" />,
      hasTime: true
    },
    {
      key: 'settlementNotifications',
      label: 'Settlement Notifications',
      description: 'Get notified when expenses are marked as settled',
      icon: <MessageSquare className="w-5 h-5 text-orange-500" />,
      hasChannels: true
    }
  ];

  const getNotificationTime = (key: NotificationKey): string => {
    if (isTimedNotification(key)) {
      const setting = currentUser.preferences.notifications[key];
      return setting.time || '09:00';
    }
    return '09:00';
  };

  const isChannelEnabled = (key: NotificationKey, channel: 'inAppEnabled' | 'emailEnabled'): boolean => {
    if (isChanneledNotification(key)) {
      const setting = currentUser.preferences.notifications[key];
      return setting[channel];
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose which notifications you'd like to receive and customize their delivery
          </p>
        </div>
        {permissionStatus === 'granted' ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Bell className="w-4 h-4" />
            <span className="text-sm">Notifications enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <BellOff className="w-4 h-4" />
            <span className="text-sm">Notifications disabled</span>
          </div>
        )}
      </div>

      {showPermissionAlert && permissionStatus !== 'granted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800">Notification Permission Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Please enable notifications in your browser settings to receive alerts and reminders.
            </p>
          </div>
          <button
            onClick={() => setShowPermissionAlert(false)}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {notifications.map(({ key, label, description, icon, hasTime, hasChannels }) => (
          <div key={key} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {icon}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentUser.preferences.notifications[key].enabled}
                  onChange={() => handleToggle(key)}
                  className="sr-only peer"
                  disabled={permissionStatus !== 'granted'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            {hasTime && currentUser.preferences.notifications[key].enabled && isTimedNotification(key) && (
              <div className="flex items-center gap-2 ml-8 pl-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={getNotificationTime(key)}
                  onChange={(e) => handleTimeChange(key, e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {hasChannels && currentUser.preferences.notifications[key].enabled && isChanneledNotification(key) && (
              <div className="ml-8 pl-3 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChannelEnabled(key, 'inAppEnabled')}
                      onChange={() => handleToggle(key, 'inAppEnabled')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">In-app notifications</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChannelEnabled(key, 'emailEnabled')}
                      onChange={() => handleToggle(key, 'emailEnabled')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email notifications</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        <p>
          Notification delivery times:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Over budget alerts are sent in real-time when limits are exceeded</li>
          <li>Monthly reminders are sent at your specified time on the 1st of each month</li>
          <li>Month-end reminders are sent at your specified time in the last 3 days</li>
          <li>Analytics reports are sent at your specified time on the 1st of each month</li>
          <li>Settlement notifications are sent immediately when expenses are marked as settled</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsSettings;
