import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../../data/services/api';
import { LoginRequest, LoginResponse } from '../../domain/models/User';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import CustomToast, { ToastType } from '../components/CustomToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');  // Changed from email to username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );
  const [toast, setToast] = useState<{visible: boolean, message: string, type: ToastType}>(
    { visible: false, message: '', type: 'info' }
  );

  const showPopup = (message: string, type: PopupType = 'info') => setPopup({ visible: true, message, type });
  
  const closePopup = () => {
    const currentType = popup.type;
    setPopup(p => ({ ...p, visible: false }));
    // AppNavigator will automatically detect login and switch to MainTabs
    // No manual navigation needed for success popup
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showPopup('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    const credentials: LoginRequest = {
      UserName: username.trim(),
      Password: password
    };
    try {
      // Call API service
      const loginResponse: LoginResponse = await userAPI.login(credentials);
      console.log('Login Response:', loginResponse);
      
      // Save user data to AsyncStorage for dashboard
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify({
          name: loginResponse.name, 
          userName: loginResponse.userName,
          email: loginResponse.email,
          userId: loginResponse.userId,
          token: loginResponse.token
        })
      );
      
      // Ensure the data is written before showing success message
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch and store user groups immediately after login
      try {
        console.log('🔍 Fetching user groups after login...');
        const userDetails = await userAPI.getUserDetails(loginResponse.token);
        const groups = userDetails.groups?.$values || [];
        
        // Store groups in AsyncStorage
        await AsyncStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.USER_GROUPS,
          JSON.stringify(groups)
        );
        console.log('✅ Groups stored successfully:', groups);
        
        // Ensure the data is written
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (groupError) {
        console.log('⚠️ Failed to fetch groups on login:', groupError);
        // Don't fail login if groups fetch fails, just store empty array
        await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_GROUPS, JSON.stringify([]));
        // Ensure the data is written
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setToast({ visible: true, message: `Welcome back, ${loginResponse.userName}!`, type: 'success' });
      
      // Force navigation to main app after successful login
      setTimeout(() => {
        setToast(t => ({ ...t, visible: false }));
        console.log('🔄 Login successful - user data stored');
        console.log('✅ AppNavigator should automatically detect login and redirect');
        
        // Trigger a manual state check in the AppNavigator by updating the AsyncStorage
        // and then letting the AppNavigator's effect detect the change
        const triggerNavigation = async () => {
          // Force re-read by setting a navigation trigger
          await AsyncStorage.setItem('@budgetwise_navigation_trigger', Date.now().toString());
        };
        triggerNavigation();
      }, 1000);
    } catch (error: any) {
      console.log('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. Please check your username or register a new account.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      showPopup(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />
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
            <Text style={styles.iconText}>💰</Text>
          </View>
          <Text style={styles.appName}>BudgetWise</Text>
          <Text style={styles.tagline}>Smart Financial Management</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentSection}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your financial journey</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#6BB6FF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#6BB6FF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Action Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>
                Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
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
    paddingBottom: 50,
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
    padding: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 20,
  },  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },  input: {
    height: 55,
    borderColor: '#B3D9FF',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: '#F8FCFF',
    color: '#2C5282',
    fontWeight: '500',
    shadowColor: '#B3D9FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },  loginButton: {
    height: 55,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 25,
  },  link: {
    fontSize: 15,
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 15,
  },
  linkHighlight: {
    fontWeight: 'bold',
    color: '#87CEEB',
  },
  backLink: {
    marginTop: 10,
  },
  backLinkText: {
    fontSize: 14,
    color: '#6BB6FF',
    textAlign: 'center',
  },
});
