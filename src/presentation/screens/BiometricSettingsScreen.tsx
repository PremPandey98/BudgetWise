import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BiometricService, BiometricSettings } from '../../services/BiometricService';
import AdaptiveStatusBar from '../components/AdaptiveStatusBar';
import CustomPopup from '../components/CustomPopup';

type BiometricSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BiometricSettings'>;

interface Props {
  navigation: BiometricSettingsScreenNavigationProp;
}

export default function BiometricSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<BiometricSettings>({
    isEnabled: false,
    hasSetup: false
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error' | 'confirm' | 'info'>('info');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupConfirmAction, setPopupConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [currentSettings, available, types] = await Promise.all([
        BiometricService.getSettings(),
        BiometricService.isAvailable(),
        BiometricService.getSupportedTypes()
      ]);

      setSettings(currentSettings);
      setIsAvailable(available);
      setSupportedTypes(types.map(type => type.toString()));
    } catch (error) {
      console.log('❌ Error loading biometric settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show popup
  const showCustomPopup = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    confirmAction?: () => void
  ) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupConfirmAction(confirmAction ? () => confirmAction : null);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupConfirmAction(null);
  };

  const handleConfirmPopup = () => {
    if (popupConfirmAction) {
      popupConfirmAction();
    }
    handleClosePopup();
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!isAvailable) {
      showCustomPopup(
        'error',
        'Not Available',
        'Biometric authentication is not available on this device. Please ensure you have enrolled biometrics in your device settings.'
      );
      return;
    }

    if (enabled) {
      // Enable biometrics
      const result = await BiometricService.enableBiometrics();
      if (result.success) {
        setSettings(prev => ({ ...prev, isEnabled: true, hasSetup: true }));
        showCustomPopup(
          'success',
          'Success',
          'Biometric authentication has been enabled successfully!'
        );
      } else {
        showCustomPopup(
          'error',
          'Failed to Enable',
          result.error || 'Could not enable biometric authentication.'
        );
      }
    } else {
      // Disable biometrics
      showCustomPopup(
        'confirm',
        'Disable Biometric Authentication',
        'Are you sure you want to disable biometric authentication? You will need to use your regular login method.',
        async () => {
          await BiometricService.disableBiometrics();
          setSettings(prev => ({ ...prev, isEnabled: false }));
        }
      );
    }
  };

  const getBiometricTypeText = () => {
    // Focus only on fingerprint for now
    if (supportedTypes.includes('1')) return 'Fingerprint';
    return 'Fingerprint Authentication';
  };

  const getBiometricIcon = (): any => {
    // Always use fingerprint icon for consistency
    return 'finger-print';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AdaptiveStatusBar backgroundColor="#F0F8FF" />
        <Text style={styles.loadingText}>Loading biometric settings...</Text>
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
        <Text style={styles.headerTitle}>Biometric Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusIconContainer}>
            <Ionicons 
              name={isAvailable ? getBiometricIcon() : 'close-circle'} 
              size={60} 
              color={isAvailable ? '#3ED598' : '#FF7A7A'} 
            />
          </View>
          <Text style={styles.statusTitle}>
            {isAvailable ? 'Fingerprint Authentication' : 'Not Available'}
          </Text>
          <Text style={styles.statusDescription}>
            {isAvailable 
              ? 'Your device supports fingerprint authentication for secure login'
              : 'Fingerprint authentication is not available on this device'
            }
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Security Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="finger-print" size={20} color="#4A90E2" />
              <Text style={styles.settingTitle}>Enable Fingerprint Login</Text>
            </View>
            <Text style={styles.settingDesc}>
              {isAvailable
                ? 'Use your fingerprint to quickly and securely access BudgetWise'
                : 'Fingerprint authentication is not available on this device'
              }
            </Text>
            <View style={styles.settingRow}>
              <Switch
                value={settings.isEnabled && isAvailable}
                onValueChange={handleToggleBiometric}
                disabled={!isAvailable}
                trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                thumbColor={settings.isEnabled && isAvailable ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Face ID Coming Soon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Future Features</Text>
          
          <View style={styles.comingSoonCard}>
            <View style={styles.comingSoonHeader}>
              <Ionicons name="scan" size={20} color="#B0B0B0" />
              <Text style={styles.comingSoonTitle}>Face ID Authentication</Text>
            </View>
            <Text style={styles.comingSoonDesc}>
              Face ID support will be available in a future update for enhanced security and convenience.
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#4A90E2" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>About Fingerprint Security</Text>
              <Text style={styles.infoDesc}>
                • Your fingerprint data never leaves your device{'\n'}
                • Authentication is processed securely by your device's hardware{'\n'}
                • You can always use your regular login as a fallback{'\n'}
                • Fingerprint login provides quick and secure access to BudgetWise
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Popup */}
      <CustomPopup
        visible={showPopup}
        type={popupType}
        title={popupTitle}
        message={popupMessage}
        onClose={handleClosePopup}
        onConfirm={popupType === 'confirm' ? handleConfirmPopup : undefined}
        confirmText={popupType === 'confirm' ? 'Disable' : undefined}
      />
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
  statusSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  comingSoonCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    opacity: 0.8,
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
    marginLeft: 8,
    flex: 1,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
    lineHeight: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#FFE4B5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFB84D',
  },
  comingSoonBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC8A00',
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
