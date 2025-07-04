import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import { userAPI } from '../../data/services/api';
import { TokenManager } from '../../data/TokenManager';
import CustomPopup, { PopupType } from '../components/CustomPopup';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );
  
  const navigation = useNavigation();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        if (userData) {
          const parsed = JSON.parse(userData);
          const userName = parsed.name || parsed.userName || '';
          const userEmail = parsed.email || '';
          
          setName(userName);
          setEmail(userEmail);
          setOriginalName(userName);
          setOriginalEmail(userEmail);
        }
      } catch (error) {
        console.log('❌ Error loading user data:', error);
        showPopup('Error loading profile data', 'error');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const showPopup = (message: string, type: PopupType = 'info') => {
    setPopup({ visible: true, message, type });
  };
  
  const closePopup = () => {
    const currentType = popup.type;
    setPopup(p => ({ ...p, visible: false }));
    // Navigate back only after closing success popup
    if (currentType === 'success') {
      navigation.goBack();
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      showPopup('Please enter your name', 'error');
      return false;
    }
    
    if (!email.trim()) {
      showPopup('Please enter your email', 'error');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showPopup('Please enter a valid email address', 'error');
      return false;
    }
    
    return true;
  };

  const hasChanges = () => {
    return name.trim() !== originalName || email.trim() !== originalEmail;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    if (!hasChanges()) {
      showPopup('No changes to save', 'info');
      return;
    }
    
    setLoading(true);
    try {
      // Get current token using TokenManager
      const token = await TokenManager.getCurrentToken();
      if (!token) {
        showPopup('User session expired. Please login again.', 'error');
        return;
      }

      // Create updated user data
      const updatedUserData = {
        name: name.trim(),
        email: email.trim(),
      };

      console.log('💾 Updating profile:', updatedUserData);

      // Call API to update profile
      const response = await userAPI.updateProfile(updatedUserData, token);
      
      console.log('✅ Profile updated successfully:', response);

      // Update stored user data
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          name: name.trim(),
          email: email.trim(),
        };

        await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }

      showPopup('Profile updated successfully!', 'success');

    } catch (error: any) {
      console.log('❌ Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response) {
        errorMessage = `Error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showPopup(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="#2C5282" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, { opacity: hasChanges() ? 1 : 0.5 }]}
            onPress={handleSave}
            disabled={!hasChanges() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.avatar}
            />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#4A90E2" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Additional Profile Options */}
          <View style={styles.additionalOptions}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="lock-closed-outline" size={20} color="#FF9500" />
              </View>
              <Text style={styles.optionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="notifications-outline" size={20} color="#00C897" />
              </View>
              <Text style={styles.optionText}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="shield-outline" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.optionText}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomPopup
        visible={popup.visible}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />
    </KeyboardAvoidingView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#4A90E2',
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
    color: '#2C5282',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
  },
  saveButtonText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F3FF',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  changePhotoText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C5282',
  },
  additionalOptions: {
    marginTop: 32,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#2C5282',
    fontWeight: '500',
  },
});
