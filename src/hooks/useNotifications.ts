import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (currentUser) {
      // Start notification checks when user is logged in
      notificationService.startNotificationChecks();

      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      // Stop notification checks when user logs out
      notificationService.stopNotificationChecks();
    }

    // Cleanup on unmount
    return () => {
      notificationService.stopNotificationChecks();
    };
  }, [currentUser]);

  return null;
};
