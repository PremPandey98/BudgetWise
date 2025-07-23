import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NotificationSettings, DEFAULT_SETTINGS } from '../../types/NotificationTypes';
import AdaptiveStatusBar from '../components/AdaptiveStatusBar';

type NotificationSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotificationSettings'>;

interface Props {
  navigation: NotificationSettingsScreenNavigationProp;
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminders: true,
    budgetAlerts: true,
    largeExpenseAlerts: true,
    lowBalanceAlerts: true,
    weeklyReports: true,
    expenseThreshold: 500,
    balanceThreshold: 100,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { NotificationService } = await import('../../services/NotificationService');
      const currentSettings = await NotificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.log('⚠️ Error loading notification settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean | number) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      const { NotificationService } = await import('../../services/NotificationService');
      await NotificationService.updateSettings({ [key]: value });
      console.log(`✅ Updated ${key} to ${value}`);
    } catch (error) {
      console.log(`⚠️ Could not update notification setting ${key}:`, error);
      // Still update local state even if service is not available
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdaptiveStatusBar backgroundColor="#F0F8FF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C5282" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Alert Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Alert Notifications</Text>
          <Text style={styles.sectionSubtitle}>Get notified about important spending events</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="warning" size={20} color="#FF7A7A" />
              <Text style={styles.settingTitle}>Large Expense Alerts</Text>
            </View>
            <Text style={styles.settingDesc}>
              Get notified when you spend more than ₹{settings.expenseThreshold}
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.largeExpenseAlerts}
                onValueChange={(value) => updateSetting('largeExpenseAlerts', value)}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.largeExpenseAlerts ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
            
            {settings.largeExpenseAlerts && (
              <View style={styles.thresholdContainer}>
                <Text style={styles.thresholdLabel}>Alert threshold: ₹</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.expenseThreshold.toString()}
                  onChangeText={(text) => {
                    const amount = parseInt(text) || 0;
                    if (amount >= 0 && amount <= 99999) {
                      updateSetting('expenseThreshold', amount);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="500"
                />
              </View>
            )}
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="card" size={20} color="#FF7A7A" />
              <Text style={styles.settingTitle}>Low Balance Alerts</Text>
            </View>
            <Text style={styles.settingDesc}>
              Get notified when your balance drops below ₹{settings.balanceThreshold}
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.lowBalanceAlerts}
                onValueChange={(value) => updateSetting('lowBalanceAlerts', value)}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.lowBalanceAlerts ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
            
            {settings.lowBalanceAlerts && (
              <View style={styles.thresholdContainer}>
                <Text style={styles.thresholdLabel}>Alert threshold: ₹</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.balanceThreshold.toString()}
                  onChangeText={(text) => {
                    const amount = parseInt(text) || 0;
                    if (amount >= 0 && amount <= 9999) {
                      updateSetting('balanceThreshold', amount);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="100"
                />
              </View>
            )}
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="bar-chart" size={20} color="#4A90E2" />
              <Text style={styles.settingTitle}>Budget Alerts</Text>
            </View>
            <Text style={styles.settingDesc}>
              Get notified when you reach 80%, 100%, or 120% of your budget
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.budgetAlerts}
                onValueChange={(value) => updateSetting('budgetAlerts', value)}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.budgetAlerts ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Reminder Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Reminder Notifications</Text>
          <Text style={styles.sectionSubtitle}>Stay on top of your expense tracking</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="time" size={20} color="#3ED598" />
              <Text style={styles.settingTitle}>Daily Reminders</Text>
            </View>
            <Text style={styles.settingDesc}>
              Daily reminder at 8 PM to log your expenses
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.dailyReminders}
                onValueChange={(value) => updateSetting('dailyReminders', value)}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.dailyReminders ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="stats-chart" size={20} color="#3ED598" />
              <Text style={styles.settingTitle}>Weekly Reports</Text>
            </View>
            <Text style={styles.settingDesc}>
              Weekly summary every Monday at 9 AM
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.weeklyReports}
                onValueChange={(value) => updateSetting('weeklyReports', value)}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.weeklyReports ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>


        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#4A90E2" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>About Notifications</Text>
              <Text style={styles.infoDesc}>
                • Notifications work even when the app is closed{'\n'}
                • Large expense and balance alerts are sent immediately{'\n'}
                • Daily and weekly reminders are scheduled automatically{'\n'}
                • You can change thresholds anytime
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#F0F8FF',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginLeft: 8,
    flex: 1,
  },
  settingDesc: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 12,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  thresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6F3FF',
  },
  thresholdLabel: {
    fontSize: 14,
    color: '#2C5282',
    marginRight: 8,
  },
  thresholdInput: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#2C5282',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    minWidth: 80,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#E6F3FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: '#4A90E2',
    lineHeight: 20,
  },
});
