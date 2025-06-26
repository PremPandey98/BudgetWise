import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomPopup from '../components/CustomPopup';
import { userAPI } from '../../data/services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [logoutPopup, setLogoutPopup] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser({
            name: parsed.name || parsed.userName || 'User',
            email: parsed.email || '',
          });
        }
      } catch {}
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLogoutPopup(false);
    try {
      // Get token from AsyncStorage
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      let token = '';
      if (userData) {
        const parsed = JSON.parse(userData);
        token = parsed.token || '';
      }
      if (token) {
        await userAPI.logout(token);
      }
    } catch (e) {
      // Optionally handle error
    }
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    // Ensure navigation goes to the root HomeScreen, not the tabbed dashboard
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.profileTitle}>Profile</Text>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#6C63FF' }]}>  
            <Ionicons name="person-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#00C897' }]}>  
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#444444' }]}>  
            <FontAwesome name="lock" size={20} color="#fff" />
          </View>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setLogoutPopup(true)}>
          <View style={[styles.menuIcon, { backgroundColor: '#FF4C5E' }]}>  
            <MaterialIcons name="power-settings-new" size={22} color="#fff" />
          </View>
          <Text style={[styles.menuText, { color: '#FF4C5E' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" style={styles.menuArrow} />
        </TouchableOpacity>
      </View>
      <CustomPopup
        visible={logoutPopup}
        message="Are you sure you want to logout?"
        type="confirm"
        onClose={() => setLogoutPopup(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Light blue background
    alignItems: 'center',
    paddingTop: 40,
  },
  profileTitle: {
    color: '#2C5282', // Dark blue text
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  avatarContainer: {
    marginBottom: 16,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4A90E2', // Blue border
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F3FF', // Lighter blue
  },
  name: {
    color: '#2C5282',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  email: {
    color: '#4A90E2',
    fontSize: 15,
    marginBottom: 24,
    marginTop: 2,
  },
  menuList: {
    width: '90%',
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    color: '#2C5282',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  menuArrow: {
    marginLeft: 8,
  },
});
