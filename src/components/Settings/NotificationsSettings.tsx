import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { Bell, BellOff, AlertCircle, Calendar, PieChart, XCircle } from 'lucide-react';

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

  const handleToggle = async (key: keyof typeof currentUser.preferences.notifications) => {
    if (currentUser) {
      // If enabling any notification and permission is not granted
      if (!currentUser.preferences.notifications[key] && permissionStatus !== 'granted') {
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
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
    {
      key: 'monthlyReminder' as const,
      label: 'Monthly Reminders',
      description: 'Receive reminders to add your expenses at the start of each month',
      icon: <Bell className="w-5 h-5 text-blue-500" />,
    },
    {
      key: 'monthEndReminder' as const,
      label: 'Month End Reminders',
      description: 'Get notified when it\'s time to settle expenses at month end',
      icon: <Calendar className="w-5 h-5 text-green-500" />,
    },
    {
      key: 'monthlyAnalytics' as const,
      label: 'Monthly Analytics',
      description: 'Receive monthly spending analysis reports',
      icon: <PieChart className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose which notifications you'd like to receive
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
        {notifications.map(({ key, label, description, icon }) => (
          <div key={key} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
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
                checked={currentUser.preferences.notifications[key]}
                onChange={() => handleToggle(key)}
                className="sr-only peer"
                disabled={permissionStatus !== 'granted'}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        <p>
          Notifications will be sent during business hours (9 AM - 6 PM) and include:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Monthly reminders on the 1st of each month</li>
          <li>Month-end settlement reminders in the last 3 days</li>
          <li>Monthly analytics reports on the 1st of each month</li>
          <li>Real-time alerts when you exceed your budget</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsSettings;
