import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings, DEFAULT_SETTINGS } from '../types/NotificationTypes';

// Re-export types for backward compatibility
export type { NotificationSettings } from '../types/NotificationTypes';

/**
 * Mock NotificationService for Expo Go
 * Provides the same interface but with fallback implementations
 */
export class NotificationService {
  private static SETTINGS_KEY = '@budgetwise_notification_settings';

  // Initialize notification permissions and settings (mock)
  static async initialize(): Promise<void> {
    console.log('📱 Notification service initialized in compatibility mode (Expo Go)');
  }

  // Mock push notification registration
  static async registerForPushNotifications(): Promise<string | null> {
    console.log('📱 Push notification registration skipped in Expo Go');
    return null;
  }

  // Get notification settings (works with AsyncStorage)
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsStr = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsStr) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) };
      }
    } catch (error) {
      console.log('❌ Error loading notification settings:', error);
    }
    return DEFAULT_SETTINGS;
  }

  // Update notification settings (works with AsyncStorage)
  static async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
      console.log('✅ Notification settings updated:', newSettings);
    } catch (error) {
      console.log('❌ Error updating notification settings:', error);
    }
  }

  // Check and notify spending with alert fallback
  static async checkAndNotifySpending(amount: number, category: string): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.largeExpenseAlerts) return;
    
    if (amount >= settings.expenseThreshold) {
      Alert.alert(
        "💰 Large Expense Alert",
        `You spent ₹${amount.toFixed(2)} on ${category}. Keep track of your budget!`,
        [{ text: "OK", style: "default" }]
      );
      console.log(`💰 Large expense alert shown: ₹${amount} on ${category}`);
    }
  }

  // Check and notify balance with alert fallback
  static async checkAndNotifyBalance(balance: number): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.lowBalanceAlerts) return;
    
    if (balance <= settings.balanceThreshold) {
      Alert.alert(
        "⚠️ Low Balance Alert",
        `Your balance is low: ₹${balance.toFixed(2)}. Consider reducing expenses.`,
        [{ text: "OK", style: "default" }]
      );
      console.log(`📢 Low balance alert shown: ₹${balance}`);
    }
  }

  // Send weekly summary with alert fallback
  static async sendWeeklySummary(expenses: number, income: number, transactionCount: number): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.weeklyReports) return;
    
    Alert.alert(
      "📊 Weekly Summary",
      `This week: ₹${expenses.toFixed(2)} spent, ₹${income.toFixed(2)} earned (${transactionCount} transactions)`,
      [{ text: "OK", style: "default" }]
    );
    console.log(`📊 Weekly summary shown: ${expenses}/${income} (${transactionCount} transactions)`);
  }

  // Send motivational notification with console log only
  static async sendMotivationalNotification(type: 'good_spending' | 'no_expenses' | 'budget_achieved'): Promise<void> {
    const messages = {
      good_spending: "🎯 Great job managing your expenses! Keep it up!",
      no_expenses: "💡 Don't forget to track your daily expenses for better budget insights.",
      budget_achieved: "🏆 Congratulations! You've stayed within your budget this month!"
    };
    
    console.log(`🎯 Motivational message: ${messages[type]}`);
  }

  // Mock daily reminder scheduling
  static async scheduleDailyReminder(): Promise<void> {
    console.log('📅 Daily reminder would be scheduled (requires development build)');
  }

  // Mock weekly report scheduling
  static async scheduleWeeklyReport(): Promise<void> {
    console.log('📅 Weekly report would be scheduled (requires development build)');
  }

  // Mock budget alert
  static async sendBudgetAlert(budget: number, spent: number): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.budgetAlerts) return;
    
    const percentage = (spent / budget) * 100;
    Alert.alert(
      "🚨 Budget Alert",
      `You've spent ${percentage.toFixed(1)}% of your budget (₹${spent.toFixed(2)} of ₹${budget.toFixed(2)}).`,
      [{ text: "OK", style: "default" }]
    );
    console.log(`🚨 Budget alert shown: ${percentage.toFixed(1)}% spent`);
  }

  // Mock notification listeners setup
  static setupNotificationListeners(): void {
    console.log('🔔 Notification listeners would be set up (requires development build)');
  }

  // Mock cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    console.log('🚫 All notifications would be cancelled (requires development build)');
  }
}
