import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BiometricService } from '../../services/BiometricService';
import AdaptiveStatusBar from '../components/AdaptiveStatusBar';
import CustomPopup from '../components/CustomPopup';

interface Props {
  onAuthenticated: () => void;
}

export default function BiometricAuthScreen({ onAuthenticated }: Props) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [supportedTypes, setSupportedTypes] = useState<string[]>([]);
  
  // Popup states
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRetryPopup, setShowRetryPopup] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Handle case where biometrics are not available - call onAuthenticated after render
  useEffect(() => {
    if (isAvailable === false) {
      // Biometrics not available, skip authentication
      onAuthenticated();
    }
  }, [isAvailable, onAuthenticated]);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isAvailable();
      const types = await BiometricService.getSupportedTypes();
      
      setIsAvailable(available);
      setSupportedTypes(types.map(type => type.toString()));
      
      console.log('🔐 Biometric check:', { available, types });
    } catch (error) {
      console.log('❌ Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
      const result = await BiometricService.authenticate();
      
      if (result.success) {
        onAuthenticated();
      } else {
        setRetryMessage(result.error || 'Authentication is required to access BudgetWise. Please try again.');
        setShowRetryPopup(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Authentication is required to access BudgetWise. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle popup actions
  const handleRetryAuth = () => {
    setShowRetryPopup(false);
    setShowErrorPopup(false);
    // Small delay to allow popup to close smoothly
    setTimeout(() => {
      handleBiometricAuth();
    }, 300);
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
  };

  const handleCloseRetryPopup = () => {
    setShowRetryPopup(false);
  };

  const getBiometricIcon = () => {
    if (supportedTypes.includes('1')) { // FINGERPRINT
      return 'finger-print';
    } else if (supportedTypes.includes('2')) { // FACIAL_RECOGNITION
      return 'scan';
    } else if (supportedTypes.includes('3')) { // IRIS
      return 'eye';
    }
    return 'lock-closed';
  };

  const getBiometricText = () => {
    if (supportedTypes.includes('1')) {
      return 'Use your fingerprint to access BudgetWise';
    } else if (supportedTypes.includes('2')) {
      return 'Use your face to access BudgetWise';
    } else if (supportedTypes.includes('3')) {
      return 'Use your iris to access BudgetWise';
    }
    return 'Use biometric authentication to access BudgetWise';
  };

  if (isAvailable === null) {
    // Still checking biometric availability - show loading
    return (
      <View style={styles.container}>
        <AdaptiveStatusBar backgroundColor="#F0F8FF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Checking biometric availability...</Text>
        </View>
      </View>
    );
  }

  if (isAvailable === false) {
    // Show loading while we handle the non-available case in useEffect
    return (
      <View style={styles.container}>
        <AdaptiveStatusBar backgroundColor="#F0F8FF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Setting up authentication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdaptiveStatusBar backgroundColor="#F0F8FF" />
      
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>BudgetWise</Text>
        <Text style={styles.appTagline}>Secure Budget Management</Text>
      </View>

      {/* Biometric Section */}
      <View style={styles.biometricContainer}>
        <View style={styles.biometricIconContainer}>
          <Ionicons 
            name={getBiometricIcon()} 
            size={80} 
            color="#4A90E2" 
          />
        </View>
        
        <Text style={styles.biometricTitle}>Secure Authentication</Text>
        <Text style={styles.biometricDescription}>
          {getBiometricText()}
        </Text>
        {/* Authentication Button */}
        <TouchableOpacity
          style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
          onPress={handleBiometricAuth}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name={getBiometricIcon()} size={24} color="#FFFFFF" />
          )}
          <Text style={styles.authButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={16} color="#3ED598" />
        <Text style={styles.securityText}>
          Biometric authentication is required for enhanced security
        </Text>
      </View>

      {/* Custom Popups */}
      <CustomPopup
        visible={showErrorPopup}
        type="biometric-error"
        title="Authentication Error"
        message={errorMessage}
        onClose={handleCloseErrorPopup}
        onRetry={handleRetryAuth}
      />

      <CustomPopup
        visible={showRetryPopup}
        type="biometric-retry"
        title="Authentication Failed"
        message={retryMessage}
        onClose={handleCloseRetryPopup}
        onRetry={handleRetryAuth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#4A90E2',
  },
  biometricContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  biometricIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 12,
    textAlign: 'center',
  },
  biometricDescription: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  securityRequirement: {
    fontSize: 14,
    color: '#FF7A7A',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  authButtonDisabled: {
    backgroundColor: '#A0C4E8',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 40,
  },
  securityText: {
    color: '#2D7D5E',
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4A90E2',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
