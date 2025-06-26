import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../../data/services/api';
import { NetworkTestUtils } from '../../utils/networkTest';
import { RegisterRequest } from '../../domain/models/User';
import CustomPopup, { PopupType } from '../components/CustomPopup';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(0); // Default to User (0)
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );

  // Debug network info on component mount
  useEffect(() => {
    NetworkTestUtils.logNetworkDebug();
  }, []);  const showPopup = (message: string, type: PopupType = 'info') => setPopup({ visible: true, message, type });
  
  const closePopup = () => {
    const currentType = popup.type;
    setPopup(p => ({ ...p, visible: false }));
    // Navigate to Login only after closing success popup
    if (currentType === 'success') {
      navigation.navigate('Login');
    }
  };const handleNetworkTest = async () => {
    showPopup('Testing connection... Check console logs for detailed results.', 'info');
    try {
      const isConnected = await NetworkTestUtils.testConnection();
      const message = isConnected 
        ? '✅ Found working endpoint! Server is reachable.' 
        : '❌ Connection test failed. Common issues: Server not running on port 5091, Different network (check WiFi), Firewall blocking connection, API endpoints not configured (all return 404). Check console logs for details.';
      showPopup(message, isConnected ? 'success' : 'error');
    } catch (error) {
      showPopup(`Test failed: ${error}`, 'error');
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      showPopup('Please enter your full name', 'error');
      return false;
    }
    if (!username.trim()) {
      showPopup('Please enter a username', 'error');
      return false;
    }
    if (!email.trim()) {
      showPopup('Please enter your email', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup('Please enter a valid email address', 'error');
      return false;
    }
    if (!password) {
      showPopup('Please enter a password', 'error');
      return false;
    }
    if (password.length < 6) {
      showPopup('Password must be at least 6 characters long', 'error');
      return false;
    }
    if (password !== confirmPassword) {
      showPopup('Passwords do not match', 'error');
      return false;
    }
    if (!phone.trim()) {
      showPopup('Please enter your phone number', 'error');
      return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      showPopup('Please enter a valid 10-digit phone number', 'error');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const registerData: RegisterRequest = {
      Name: name.trim(),
      UserName: username.trim(),
      Email: email.trim().toLowerCase(),
      Password: password,
      Phone: phone.replace(/\D/g, ''),
      Role: role
    };    try {
      const result = await userAPI.register(registerData);      showPopup('Account created successfully!', 'success');
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your inputs.';
        } else if (error.response.status === 404) {
          errorMessage = 'Registration endpoint not found. Please check your backend server configuration.';
        } else if (error.response.status === 409) {
          errorMessage = 'Username or email already exists. Please try different ones.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check: Your server is running on port 5091, Both devices are on the same WiFi network, Your computer\'s firewall allows port 5091, Check console logs for detailed error info';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Connection failed. Troubleshooting steps: Ensure your API server is running, Check if you\'re using the correct device type: Android Emulator: Use 10.0.2.2:5091, iOS Simulator: Use localhost:5091, Physical Device: Use 192.168.0.144:5091, Verify both devices are on same network';
      }
      showPopup(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomPopup visible={popup.visible} message={popup.message} type={popup.type} onClose={closePopup} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header Section with Gradient Effect */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={styles.appName}>BudgetWise</Text>
            <Text style={styles.tagline}>Your Financial Journey Starts Here</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of users managing their finances smartly</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#6BB6FF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="#6BB6FF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#6BB6FF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#6BB6FF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#6BB6FF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#6BB6FF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
            {/* Network Test Button - Temporarily disabled for debugging */}
            {false ? (
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={handleNetworkTest}
              >
                <Text style={styles.testButtonText}>🔍 Test Network Connection</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Action Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>
                  Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  scrollContainer: {
    flex: 1,
  },  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerSection: {
    backgroundColor: '#4A90E2',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#87CEEB',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 35,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },  tagline: {
    fontSize: 16,
    color: '#E6F3FF',
    fontWeight: '500',
  },
  contentSection: {
    flex: 1,
    padding: 25,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    borderTopWidth: 3,
    borderTopColor: '#87CEEB',
  },
  inputContainer: {
    marginBottom: 18,
  },  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 6,
  },  input: {
    height: 50,
    borderColor: '#B3D9FF',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#F8FCFF',
    color: '#2C5282',
    fontWeight: '500',
    shadowColor: '#B3D9FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },  registerButton: {
    height: 55,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 15,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#A8C8EC',
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
  },  link: {
    fontSize: 15,
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 12,
  },
  linkHighlight: {
    fontWeight: 'bold',
    color: '#87CEEB',
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#6BB6FF',
    textAlign: 'center',
  },
});
