import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { AlertCircle, Calendar, MessageSquare, Mail, Clock, XCircle } from 'lucide-react';
import type { NotificationPreferences, TimedNotificationSetting, ChanneledNotificationSetting } from '../../types';

type NotificationKey = keyof Omit<NotificationPreferences, 'globalEnabled'>;

interface NotificationSetting {
  key: NotificationKey;
  label: string;
  description: string;
  icon: JSX.Element;
  hasTime?: boolean;
  hasChannels?: boolean;
}

const isTimedNotification = (key: NotificationKey): key is 'monthlyReminder' => {
  return key === 'monthlyReminder';
};

const isChanneledNotification = (key: NotificationKey): key is 'settlementNotifications' | 'overBudget' => {
  return key === 'settlementNotifications' || key === 'overBudget';
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

  const handleGlobalToggle = async () => {
    if (!currentUser) return;

    if (!currentUser.preferences.notifications.globalEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission !== 'granted') {
          setShowPermissionAlert(true);
          return;
        }
      }
    }

    updateUser({
      preferences: {
        ...currentUser.preferences,
        notifications: {
          ...currentUser.preferences.notifications,
          globalEnabled: !currentUser.preferences.notifications.globalEnabled
        }
      }
    });
  };

  const handleToggle = async (key: NotificationKey, subKey: string = 'enabled') => {
    if (!currentUser) return;

    if (!currentUser.preferences.notifications.globalEnabled && subKey === 'enabled') {
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
    const setting = { ...notifications[key] };

    if (isChanneledNotification(key)) {
      const channelSetting = setting as ChanneledNotificationSetting;
      if (subKey === 'enabled' || subKey === 'inAppEnabled' || subKey === 'emailEnabled') {
        channelSetting[subKey] = !channelSetting[subKey];
      }
      notifications[key] = channelSetting;
    } else if (isTimedNotification(key)) {
      const timedSetting = setting as TimedNotificationSetting;
      if (subKey === 'enabled') {
        timedSetting.enabled = !timedSetting.enabled;
      }
      notifications[key] = timedSetting;
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
    const setting = { ...notifications[key] } as TimedNotificationSetting;
    setting.time = time;
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
      hasChannels: true
    },
    {
      key: 'monthlyReminder',
      label: 'Monthly Expense Reminder',
      description: 'Receive reminders to add your expenses on the last day of each month',
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
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

  const getNotificationSetting = (key: NotificationKey) => {
    const setting = currentUser.preferences.notifications[key];
    if (isTimedNotification(key)) {
      return setting as TimedNotificationSetting;
    }
    if (isChanneledNotification(key)) {
      return setting as ChanneledNotificationSetting;
    }
    return setting;
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
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={currentUser.preferences.notifications.globalEnabled}
            onChange={handleGlobalToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {currentUser.preferences.notifications.globalEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
          </span>
        </label>
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
        {notifications.map(({ key, label, description, icon, hasTime, hasChannels }) => {
          const setting = getNotificationSetting(key);
          return (
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
                    checked={setting.enabled}
                    onChange={() => handleToggle(key)}
                    className="sr-only peer"
                    disabled={!currentUser.preferences.notifications.globalEnabled}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {hasTime && isTimedNotification(key) && setting.enabled && (
                <div className="flex items-center gap-2 ml-8 pl-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={(setting as TimedNotificationSetting).time || '17:00'}
                    onChange={(e) => handleTimeChange(key, e.target.value)}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!currentUser.preferences.notifications.globalEnabled}
                  />
                </div>
              )}

              {hasChannels && isChanneledNotification(key) && setting.enabled && (
                <div className="ml-8 pl-3 space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(setting as ChanneledNotificationSetting).inAppEnabled}
                        onChange={() => handleToggle(key, 'inAppEnabled')}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={!currentUser.preferences.notifications.globalEnabled}
                      />
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">In-app notifications</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(setting as ChanneledNotificationSetting).emailEnabled}
                        onChange={() => handleToggle(key, 'emailEnabled')}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={!currentUser.preferences.notifications.globalEnabled}
                      />
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Email notifications</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm text-gray-500">
        <p>
          Notification delivery times:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Over budget alerts are sent in real-time when limits are exceeded</li>
          <li>Monthly reminders are sent at your specified time on the last day of each month</li>
          <li>Settlement notifications are sent immediately when expenses are marked as settled</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsSettings;
