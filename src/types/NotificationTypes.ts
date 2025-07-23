export interface NotificationSettings {
  dailyReminders: boolean;
  budgetAlerts: boolean;
  largeExpenseAlerts: boolean;
  lowBalanceAlerts: boolean;
  weeklyReports: boolean;
  expenseThreshold: number; // Amount in rupees
  balanceThreshold: number; // Minimum balance in rupees
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminders: true,
  budgetAlerts: true,
  largeExpenseAlerts: true,
  lowBalanceAlerts: true,
  weeklyReports: true,
  expenseThreshold: 500,
  balanceThreshold: 100,
};
