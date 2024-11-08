import React from 'react';
import { useUserStore } from '../../store/userStore';

const NotificationsSettings = () => {
  const { currentUser, updateUser } = useUserStore();

  if (!currentUser) return null;

  const handleToggle = (key: keyof typeof currentUser.preferences.notifications) => {
    if (currentUser) {
      updateUser(currentUser.id, {
        preferences: {
          ...currentUser.preferences,
          notifications: {
            ...currentUser.preferences.notifications,
            [key]: !currentUser.preferences.notifications[key],
          },
        },
      });
    }
  };

  const notifications = [
    {
      key: 'overBudget' as const,
      label: 'Over Budget Alerts',
      description: 'Get notified when you exceed your budget limits',
    },
    {
      key: 'monthlyReminder' as const,
      label: 'Monthly Reminders',
      description: 'Receive reminders to add your expenses',
    },
    {
      key: 'monthEndReminder' as const,
      label: 'Month End Reminders',
      description: 'Get notified when it\'s time to settle expenses',
    },
    {
      key: 'monthlyAnalytics' as const,
      label: 'Monthly Analytics',
      description: 'Receive monthly spending analysis reports',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {notifications.map(({ key, label, description }) => (
            <div key={key} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentUser.preferences.notifications[key]}
                  onChange={() => handleToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;