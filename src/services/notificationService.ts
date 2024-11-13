import { useUserStore } from '../store/userStore';
import { useExpenseStore } from '../store/expenseStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, isLastDayOfMonth } from 'date-fns';
import type { NotificationAlert } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;
  private checkInterval: number | null = null;
  private alerts: NotificationAlert[] = [];

  private constructor() {
    this.requestPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async requestPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  private async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (this.hasPermission) {
      try {
        new Notification(title, {
          icon: '/aafairshare.png',
          badge: '/aafairshare.png',
          ...options,
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  public startNotificationChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check notifications every minute to handle custom times
    this.checkInterval = window.setInterval(() => {
      this.checkAllNotifications();
    }, 60 * 1000);

    // Check immediately
    this.checkAllNotifications();
  }

  public stopNotificationChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private isTimeToNotify(preferredTime?: string): boolean {
    if (!preferredTime) return true;
    
    const now = new Date();
    const [hours, minutes] = preferredTime.split(':').map(Number);
    return now.getHours() === hours && now.getMinutes() === minutes;
  }

  private async checkAllNotifications(): Promise<void> {
    const { currentUser } = useUserStore.getState();
    if (!currentUser || !currentUser.preferences.notifications.globalEnabled) return;

    const { notifications } = currentUser.preferences;
    const now = new Date();

    // Monthly Reminder (last day of month)
    if (notifications.monthlyReminder.enabled && 
        isLastDayOfMonth(now) && 
        this.isTimeToNotify(notifications.monthlyReminder.time)) {
      this.showMonthlyReminder();
    }

    // Over Budget Check (runs every hour during the day)
    if (notifications.overBudget.enabled && 
        now.getHours() >= 9 && 
        now.getHours() <= 18) {
      this.checkBudgetLimits();
    }
  }

  private async showMonthlyReminder(): Promise<void> {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const nextMonth = format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM');
    const alertId = `monthly-reminder-${currentMonth}`;

    const alert: NotificationAlert = {
      id: alertId,
      type: 'monthlyReminder',
      title: 'Monthly Expense Reminder',
      message: `Please enter all household expenses for ${currentMonth} before we begin ${nextMonth}.`,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);
    await this.showNotification(alert.title, {
      body: alert.message,
      tag: alertId,
    });
  }

  private async checkBudgetLimits(): Promise<void> {
    const { expenses } = useExpenseStore.getState();
    const { currentUser } = useUserStore.getState();
    
    if (!currentUser?.preferences.notifications.overBudget.enabled) return;
    
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    // Group expenses by category
    const categoryExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start, end });
      })
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

    // Check each category against its budget
    Object.entries(categoryExpenses).forEach(async ([category, amount]) => {
      const budget = 2000; // This should come from actual budget settings
      if (amount > budget) {
        const alertId = `over-budget-${category}-${format(now, 'yyyy-MM')}`;
        
        // Check if this alert was already dismissed
        if (currentUser.preferences.notifications.overBudget.dismissedAlerts?.includes(alertId)) {
          return;
        }

        const alert: NotificationAlert = {
          id: alertId,
          type: 'overBudget',
          title: 'Budget Alert',
          message: `Category "${category}" has exceeded its budget! Current spending: £${amount.toFixed(2)}`,
          timestamp: new Date().toISOString(),
          category,
          amount
        };

        this.alerts.push(alert);

        // Send in-app notification
        if (currentUser.preferences.notifications.overBudget.inAppEnabled) {
          await this.showNotification(alert.title, {
            body: alert.message,
            tag: alertId,
          });
        }

        // Send email notification
        if (currentUser.preferences.notifications.overBudget.emailEnabled) {
          // Email sending logic would go here
          console.log('Sending over budget email notification');
        }
      }
    });
  }

  public async showSettlementNotification(settledBy: string, month: string): Promise<void> {
    const { currentUser } = useUserStore.getState();
    if (!currentUser?.preferences.notifications.settlementNotifications.enabled) return;

    const alertId = `settlement-${month}-${settledBy}`;
    const alert: NotificationAlert = {
      id: alertId,
      type: 'settlement',
      title: 'Settlement Notification',
      message: `${settledBy} has marked ${month} as settled. Please review and confirm.`,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);

    // Show in-app notification
    if (currentUser.preferences.notifications.settlementNotifications.inAppEnabled) {
      await this.showNotification(alert.title, {
        body: alert.message,
        tag: alertId,
      });
    }

    // Send email notification
    if (currentUser.preferences.notifications.settlementNotifications.emailEnabled) {
      // Email sending logic would go here
      console.log('Sending settlement email notification');
    }
  }

  public dismissAlert(alertId: string): void {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return;

    const alert = this.alerts.find(a => a.id === alertId);
    if (alert?.type === 'overBudget') {
      const dismissedAlerts = [
        ...(currentUser.preferences.notifications.overBudget.dismissedAlerts || []),
        alertId
      ];

      useUserStore.getState().updateUser({
        preferences: {
          ...currentUser.preferences,
          notifications: {
            ...currentUser.preferences.notifications,
            overBudget: {
              ...currentUser.preferences.notifications.overBudget,
              dismissedAlerts
            }
          }
        }
      });
    }

    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }

  public getAlerts(): NotificationAlert[] {
    return this.alerts;
  }
}

export const notificationService = NotificationService.getInstance();
