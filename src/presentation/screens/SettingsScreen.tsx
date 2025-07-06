import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import CustomPopup, { PopupType } from '../components/CustomPopup';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [currencyPreference, setCurrencyPreference] = useState('USD');
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );
  
  const navigation = useNavigation();

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.APP_SETTINGS);
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notifications ?? true);
        setBiometricEnabled(parsed.biometric ?? false);
        setAutoBackupEnabled(parsed.autoBackup ?? false);
        setDarkModeEnabled(parsed.darkMode ?? false);
        setCurrencyPreference(parsed.currency ?? 'USD');
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const currentSettings = {
        notifications: notificationsEnabled,
        biometric: biometricEnabled,
        autoBackup: autoBackupEnabled,
        darkMode: darkModeEnabled,
        currency: currencyPreference,
        ...newSettings,
      };
      
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(currentSettings));
      console.log('Settings saved successfully');
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const showPopup = (message: string, type: PopupType = 'info') => {
    setPopup({ visible: true, message, type });
  };
  
  const closePopup = () => {
    setPopup(p => ({ ...p, visible: false }));
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveSettings({ notifications: value });
    showPopup(
      value ? 'Notifications enabled' : 'Notifications disabled',
      'success'
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricEnabled(value);
    await saveSettings({ biometric: value });
    showPopup(
      value ? 'Biometric authentication enabled' : 'Biometric authentication disabled',
      'success'
    );
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    setAutoBackupEnabled(value);
    await saveSettings({ autoBackup: value });
    showPopup(
      value ? 'Auto backup enabled' : 'Auto backup disabled',
      'success'
    );
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkModeEnabled(value);
    await saveSettings({ darkMode: value });
    showPopup(
      value ? 'Dark mode enabled (coming soon)' : 'Light mode enabled',
      'info'
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses, groups, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all app data except user authentication
              await AsyncStorage.multiRemove([
                APP_CONFIG.STORAGE_KEYS.USER_GROUPS,
                APP_CONFIG.STORAGE_KEYS.ACTIVE_GROUP,
                APP_CONFIG.STORAGE_KEYS.PERSONAL_EXPENSES,
                APP_CONFIG.STORAGE_KEYS.APP_SETTINGS,
              ]);
              
              // Clear all group-specific expenses
              const allKeys = await AsyncStorage.getAllKeys();
              const groupExpenseKeys = allKeys.filter(key => 
                key.startsWith(APP_CONFIG.STORAGE_KEYS.GROUP_EXPENSES_PREFIX)
              );
              if (groupExpenseKeys.length > 0) {
                await AsyncStorage.multiRemove(groupExpenseKeys);
              }
              
              showPopup('All data cleared successfully', 'success');
              
              // Reset settings to default
              setNotificationsEnabled(true);
              setBiometricEnabled(false);
              setAutoBackupEnabled(false);
              setDarkModeEnabled(false);
              setCurrencyPreference('USD');
            } catch (error) {
              showPopup('Error clearing data', 'error');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    showPopup('Export data feature coming soon!', 'info');
  };

  const handleImportData = () => {
    showPopup('Import data feature coming soon!', 'info');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact support?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@budgetwise.com?subject=BudgetWise Support')
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL('https://wa.me/1234567890')
        }
      ]
    );
  };

  const handleRateApp = () => {
    // For production, replace with actual app store URLs
    Alert.alert(
      'Rate BudgetWise',
      'Would you like to rate our app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rate on Store',
          onPress: () => showPopup('Redirecting to app store...', 'info')
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About BudgetWise',
      'BudgetWise v1.0.0\n\nA simple and powerful expense tracking app for individuals and groups.\n\nDeveloped by Akshay and Prem ',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C5282" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#00C897' }]}>
                <Ionicons name="notifications" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>Get notified about expenses and reminders</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E5E7EB', true: '#00C897' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#6C63FF' }]}>
                <Ionicons name="finger-print" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
                <Text style={styles.settingSubtitle}>Use fingerprint or face ID to unlock</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E5E7EB', true: '#6C63FF' }}
              thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto Backup</Text>
                <Text style={styles.settingSubtitle}>Automatically backup your data</Text>
              </View>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={handleAutoBackupToggle}
              trackColor={{ false: '#E5E7EB', true: '#FF9500' }}
              thumbColor={autoBackupEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#444444' }]}>
                <Ionicons name="moon" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Switch to dark theme (coming soon)</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#E5E7EB', true: '#444444' }}
              thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4A90E2' }]}>
                <FontAwesome name="dollar" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Currency</Text>
                <Text style={styles.settingSubtitle}>USD - US Dollar</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#00C897' }]}>
                <Ionicons name="download" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Export Data</Text>
                <Text style={styles.settingSubtitle}>Download your data as backup</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Import Data</Text>
                <Text style={styles.settingSubtitle}>Restore data from backup</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF4C5E' }]}>
                <Ionicons name="trash" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Clear All Data</Text>
                <Text style={styles.settingSubtitle}>Permanently delete all app data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Info</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="chatbubble" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Contact Support</Text>
                <Text style={styles.settingSubtitle}>Get help and report issues</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleRateApp}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="star" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Rate BudgetWise</Text>
                <Text style={styles.settingSubtitle}>Leave a review on the app store</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#6C63FF' }]}>
                <Ionicons name="information-circle" size={20} color="#fff" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>About BudgetWise</Text>
                <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomPopup
        visible={popup.visible}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  headerRight: {
    width: 40, // Balance the header
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#4A90E2',
  },
});
