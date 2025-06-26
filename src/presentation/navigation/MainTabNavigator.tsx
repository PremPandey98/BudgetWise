import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { View, Text } from 'react-native';

// Placeholder screens for Expense, Deposit
function ExpenseScreen() {
  return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Expense</Text></View>;
}
function DepositScreen() {
  return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Deposit (Wallet)</Text></View>;
}

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(74, 144, 226, 0.95)',
          borderTopColor: '#4A90E2',
          height: 64,
          marginHorizontal: 0,
          marginBottom: 0,
          borderRadius: 0, // Remove curve
          shadowColor: '#4A90E2',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          height: '100%',
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconColor = '#fff';
          if (route.name === 'Home') {
            return <Ionicons name="home" size={28} color={iconColor} style={{ alignSelf: 'center' }} />;
          } else if (route.name === 'Expense') {
            return <MaterialIcons name="bar-chart" size={26} color={iconColor} style={{ alignSelf: 'center' }} />;
          } else if (route.name === 'Deposit') {
            return <FontAwesome name="credit-card" size={24} color={iconColor} style={{ alignSelf: 'center' }} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name="person-outline" size={26} color={iconColor} style={{ alignSelf: 'center' }} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Expense" component={ExpenseScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
