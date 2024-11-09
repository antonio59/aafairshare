import { useUserStore } from '../store/userStore';
import { useExpenseStore } from '../store/expenseStore';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;
  private checkInterval: number | null = null;

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
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  public startNotificationChecks(): void {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check notifications every hour
    this.checkInterval = window.setInterval(() => {
      this.checkAllNotifications();
    }, 60 * 60 * 1000); // Every hour

    // Also check immediately
    this.checkAllNotifications();
  }

  public stopNotificationChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkAllNotifications(): Promise<void> {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return;

    const { notifications } = currentUser.preferences;
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();

    // Only check during business hours (9 AM to 6 PM)
    if (currentHour < 9 || currentHour > 18) return;

    // Monthly Reminder (1st day of month)
    if (notifications.monthlyReminder && currentDay === 1 && currentHour === 9) {
      this.showMonthlyReminder();
    }

    // Month End Reminder (last 3 days of month)
    if (notifications.monthEndReminder && currentDay >= 28 && currentHour === 10) {
      this.showMonthEndReminder();
    }

    // Monthly Analytics (1st day of month)
    if (notifications.monthlyAnalytics && currentDay === 1 && currentHour === 11) {
      this.showMonthlyAnalytics();
    }

    // Over Budget Check (daily at 12 PM)
    if (notifications.overBudget && currentHour === 12) {
      this.checkBudgetLimits();
    }
  }

  private async showMonthlyReminder(): Promise<void> {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    await this.showNotification(
      'Monthly Expense Reminder',
      {
        body: `Don't forget to add your expenses for ${currentMonth}!`,
        tag: 'monthly-reminder',
      }
    );
  }

  private async showMonthEndReminder(): Promise<void> {
    const currentMonth = format(new Date(), 'MMMM');
    await this.showNotification(
      'Month End Settlement Reminder',
      {
        body: `Time to settle expenses for ${currentMonth}! Review and settle your shared expenses.`,
        tag: 'month-end-reminder',
      }
    );
  }

  private async showMonthlyAnalytics(): Promise<void> {
    const { expenses } = useExpenseStore.getState();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const start = startOfMonth(lastMonth);
    const end = endOfMonth(lastMonth);
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthName = format(lastMonth, 'MMMM yyyy');

    await this.showNotification(
      'Monthly Spending Analysis',
      {
        body: `Your total spending for ${monthName} was £${total.toFixed(2)}. Check the analytics page for more details!`,
        tag: 'monthly-analytics',
      }
    );
  }

  private async checkBudgetLimits(): Promise<void> {
    const { expenses } = useExpenseStore.getState();
    const currentMonth = new Date();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Example budget limit - this should be configurable in the future
    const budgetLimit = 2000;
    
    if (total > budgetLimit) {
      await this.showNotification(
        'Budget Alert',
        {
          body: `You've exceeded your monthly budget! Current spending: £${total.toFixed(2)}`,
          tag: 'budget-alert',
        }
      );
    }
  }
}

export const notificationService = NotificationService.getInstance();
