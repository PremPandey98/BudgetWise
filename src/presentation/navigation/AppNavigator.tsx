import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { APP_CONFIG } from '../../core/config/constants';
import SplashScreen from '../screens/SplashScreen';
import AppLoadingScreen from '../screens/AppLoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ViewGroupScreen from '../screens/ViewGroupScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  MainTabs: undefined;
  CreateGroup: undefined;
  AddExpense: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ViewGroup: {
    group: {
      id: string;
      groupName: string;
      groupCode: string;
      description?: string;
      createdAt?: string;
      memberCount?: number;
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      const loggedIn = !!userData;
      
      // Simulate some loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always update state to force re-render
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
      
      return loggedIn;
    } catch (e) {
      console.error('Login check error:', e);
      setIsLoggedIn(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    checkLoginStatus();
  };

  useEffect(() => {
    // Don't start checking login until splash is complete
    if (showSplash) return;
    
    checkLoginStatus();
    
    // Add a more frequent check during the first few seconds after component mount
    const intervalId = setInterval(checkLoginStatus, 500); // Check every 500ms for faster response
    
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      // Continue with less frequent checks for long-term stability
      const slowInterval = setInterval(checkLoginStatus, 2000); // Check every 2 seconds
      
      const longTimeoutId = setTimeout(() => {
        clearInterval(slowInterval);
      }, 30000); // Stop after 30 seconds
      
      return () => clearInterval(slowInterval);
    }, 5000); // Fast checking for 5 seconds
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [checkLoginStatus, showSplash]);

  // Listen for app state changes to recheck login status
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkLoginStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Also listen for storage changes (like after login)
    const checkForNavigationTrigger = setInterval(async () => {
      try {
        const trigger = await AsyncStorage.getItem('@budgetwise_navigation_trigger');
        if (trigger) {
          await AsyncStorage.removeItem('@budgetwise_navigation_trigger');
          checkLoginStatus();
        }
      } catch (e) {
        // Ignore errors
      }
    }, 500);
    
    return () => {
      subscription?.remove();
      clearInterval(checkForNavigationTrigger);
    };
  }, [checkLoginStatus]);

  // Remove the aggressive polling - AppState listener is sufficient

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // Show loading screen while checking auth
  if (isLoading) {
    return <AppLoadingScreen message="Initializing BudgetWise..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Home'}
        screenOptions={{ headerShown: false }}
      >
        {isLoggedIn ? (
          // Logged in users - only app screens, no auth screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            
            {/* Modal screens */}
            <Stack.Screen 
              name="CreateGroup" 
              component={CreateGroupScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="ViewGroup" 
              component={ViewGroupScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          // Not logged in - only auth screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
