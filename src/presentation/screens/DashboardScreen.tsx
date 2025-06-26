import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import { useFocusEffect } from '@react-navigation/native';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const demoBalance = {
  total: 484.0,
  income: 2379.0,
  expense: 1895.0,
};

const demoTransactions = [
  {
    id: '1',
    category: 'Health',
    icon: 'heart',
    iconColor: '#FF4C5E',
    bgColor: '#2D2D2D',
    amount: -25,
    desc: 'checkup fee',
    date: '11 Dec',
  },
  {
    id: '2',
    category: 'Income',
    icon: 'attach-money',
    iconColor: '#3ED598',
    bgColor: '#2D2D2D',
    amount: 60,
    desc: 'Gift from Family',
    date: '10 Dec',
  },
  {
    id: '3',
    category: 'Clothing',
    icon: 'tshirt',
    iconColor: '#A259FF',
    bgColor: '#2D2D2D',
    amount: -20,
    desc: 'Winter Clothing',
    date: '10 Dec',
  },
  {
    id: '4',
    category: 'Income',
    icon: 'attach-money',
    iconColor: '#3ED598',
    bgColor: '#2D2D2D',
    amount: 90,
    desc: 'Cashback from Credit Card',
    date: '9 Dec',
  },
  {
    id: '5',
    category: 'Dining',
    icon: 'restaurant',
    iconColor: '#FF7363',
    bgColor: '#2D2D2D',
    amount: -30,
    desc: 'Had dinner at hotel',
    date: '9 Dec',
  },
];

export default function DashboardScreen({ navigation }: Props) {
  const [logoutPopup, setLogoutPopup] = useState({ visible: false });
  const [userName, setUserName] = useState<string>('');

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || user.userName || 'User');
        } else {
          setUserName('User');
        }
      } catch (e) {
        setUserName('User');
      }
    };
    fetchUserData();
  }, []);

  // Prevent back navigation to Login/Register
  // useFocusEffect(
  //   React.useCallback(() => {
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: 'MainTabs' }],
  //     });
  //   }, [navigation])
  // );

  const showLogoutConfirmation = () => {
    setLogoutPopup({ visible: true });
  };

  const handleLogout = async () => {
    setLogoutPopup({ visible: false });
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    navigation.navigate('Home'); // Use navigate instead of replace to avoid RESET warning
  };

  const handleLogoutCancel = () => {
    setLogoutPopup({ visible: false });
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: '#F8FCFF' }]}>  
      <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '22' }]}>  
        {item.icon === 'heart' && (
          <Ionicons name="heart" size={24} color={item.iconColor} />
        )}
        {item.icon === 'attach-money' && (
          <MaterialIcons name="attach-money" size={24} color={item.iconColor} />
        )}
        {item.icon === 'tshirt' && (
          <FontAwesome5 name="tshirt" size={20} color={item.iconColor} />
        )}
        {item.icon === 'restaurant' && (
          <MaterialIcons name="restaurant" size={22} color={item.iconColor} />
        )}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionCategory, { backgroundColor: item.iconColor }]}>{item.category}</Text>
        <Text style={styles.transactionDesc}>{item.desc}</Text>
      </View>
      <View style={styles.transactionMeta}>
        <Text style={[styles.transactionAmount, { color: item.amount > 0 ? '#3ED598' : '#FF4C5E' }]}>  {item.amount > 0 ? '+' : '-'}${Math.abs(item.amount)}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.helloText}>Hello,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>$ {demoBalance.total.toFixed(2)}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceCol}>
            <Ionicons name="arrow-down" size={18} color="#3ED598" />
            <Text style={styles.incomeLabel}>Income</Text>
            <Text style={styles.incomeValue}>${demoBalance.income.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceCol}>
            <Ionicons name="arrow-up" size={18} color="#FF4C5E" />
            <Text style={styles.expenseLabel}>Expense</Text>
            <Text style={styles.expenseValue}>${demoBalance.expense.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.recentTitle}>Recent Transactions</Text>
      <FlatList
        data={demoTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      <CustomPopup 
        visible={logoutPopup.visible}
        message="Are you sure you want to logout?"
        type="confirm"
        onClose={handleLogoutCancel}
        onConfirm={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Light blue background
    paddingHorizontal: 0,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  helloText: {
    color: '#4A90E2', // Blue text
    fontSize: 15,
    fontWeight: '400',
  },
  userName: {
    color: '#2C5282', // Dark blue text
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  searchIcon: {
    backgroundColor: '#E6F3FF', // Lighter blue
    borderRadius: 20,
    padding: 8,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF', // White card
    borderRadius: 20,
    marginHorizontal: 18,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    color: '#4A90E2',
    fontSize: 15,
    marginBottom: 6,
  },
  balanceValue: {
    color: '#2C5282',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  balanceCol: {
    alignItems: 'center',
    flex: 1,
  },
  incomeLabel: {
    color: '#4A90E2',
    fontSize: 13,
    marginTop: 2,
  },
  incomeValue: {
    color: '#3ED598',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  expenseLabel: {
    color: '#4A90E2',
    fontSize: 13,
    marginTop: 2,
  },
  expenseValue: {
    color: '#FF4C5E',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  recentTitle: {
    color: '#2C5282',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 24,
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#F8FCFF', // Lighter card background
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#E6F3FF', // Lighter blue for icon background
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  transactionDesc: {
    color: '#4A90E2',
    fontSize: 13,
    marginTop: 2,
  },
  transactionMeta: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    color: '#4A90E2',
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#4A90E2', // Blue FAB
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
