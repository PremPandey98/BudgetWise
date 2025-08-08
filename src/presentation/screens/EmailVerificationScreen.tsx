import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../../data/services/api';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import { useTheme } from '../../core/theme/ThemeContext';

type EmailVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  email: string;
  isPasswordReset?: boolean;
}

export default function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const route = useRoute();
  const { email, isPasswordReset = false } = route.params as RouteParams;
  
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );

  const { theme } = useTheme();
  const otpRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const showPopup = (message: string, type: PopupType = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    const currentType = popup.type;
    setPopup(p => ({ ...p, visible: false }));
    
    if (currentType === 'success') {
      if (isPasswordReset) {
        navigation.navigate('ResetPassword', { email, otpCode: otpCode.join('') });
      } else {
        navigation.navigate('Register', { email, verified: true });
      }
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (otpCode[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      showPopup('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isPasswordReset) {
        // For password reset, just validate the format and navigate to ResetPassword screen
        // The actual OTP verification will happen when setting the new password
        showPopup('Code verified! Please set your new password.', 'success');
      } else {
        // For email verification during registration
        await userAPI.verifyEmail(email, code);
        showPopup('Email verified successfully!', 'success');
      }
    } catch (error: any) {
      let errorMessage = 'Verification failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid or expired OTP code. Please try again.';
      }
      showPopup(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      if (isPasswordReset) {
        await userAPI.sendPasswordReset(email);
      } else {
        await userAPI.sendEmailVerification(email);
      }
      showPopup('Verification code sent successfully!', 'success');
      setTimer(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
    } catch (error: any) {
      let errorMessage = 'Failed to send verification code. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showPopup(errorMessage, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.fullContainer, { backgroundColor: theme.colors.background }]}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <KeyboardAvoidingView 
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isPasswordReset ? 'Reset Password' : 'Verify Email'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name="mail" size={60} color={theme.colors.primary} />
        </View>

        {/* Title and Description */}
        <Text style={[styles.title, { color: theme.colors.secondary }]}>
          {isPasswordReset ? 'Check Your Email' : 'Verify Your Email'}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {isPasswordReset 
            ? `We've sent a password reset code to\n${email}`
            : `We've sent a verification code to\n${email}`
          }
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otpCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) otpRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: digit ? theme.colors.primary : theme.colors.surface,
                  color: theme.colors.text,
                }
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(index);
                }
              }}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectionColor={theme.colors.primary}
              underlineColorAndroid="transparent"
              autoFocus={index === 0}
              blurOnSubmit={false}
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: theme.colors.primary },
            (loading || otpCode.join('').length !== 6) && styles.buttonDisabled
          ]}
          onPress={handleVerifyOtp}
          disabled={loading || otpCode.join('').length !== 6}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>
              {isPasswordReset ? 'Verify & Continue' : 'Verify Email'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
            Didn't receive the code?
          </Text>
          
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={resendLoading}
              activeOpacity={0.7}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={[styles.resendButtonText, { color: theme.colors.primary }]}>
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timerText, { color: theme.colors.textSecondary }]}>
              Resend in {formatTime(timer)}
            </Text>
          )}
        </View>
        </ScrollView>

        <CustomPopup
          visible={popup.visible}
          message={popup.message}
          type={popup.type}
          onClose={closePopup}
        />
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
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
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
