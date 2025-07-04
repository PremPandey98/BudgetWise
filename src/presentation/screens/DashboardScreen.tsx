import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import { useFocusEffect } from '@react-navigation/native';
import { expenseAPI, userAPI } from '../../data/services/api';
import { TokenManager } from '../../data/TokenManager';
import ContextIndicator from '../components/ContextIndicator';

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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState({
    total: 0,
    income: 0,
    expense: 0,
  });

  // Function to fetch expenses from API
  const fetchExpenses = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Use TokenManager to get current context token (personal or group)
      const token = await TokenManager.getCurrentToken();
      
      if (!token) {
        console.log('❌ No token available - user may need to login again');
        // Fall back to demo data when no token
        setExpenses(demoTransactions);
        setBalance(demoBalance);
        return;
      }
      
      console.log('🔍 Fetching context-aware expenses from API...');
      console.log('🔑 Using token (first 20 chars):', token.substring(0, 20) + '...');
      
      const expensesData = await expenseAPI.getAllRelatedExpenseRecords(token);
      console.log('✅ Context-aware expenses loaded:', expensesData);
          
      // Handle the API response structure with $values
      let expenseList = [];
      if (expensesData && expensesData.$values) {
        expenseList = expensesData.$values;
      } else if (Array.isArray(expensesData)) {
        expenseList = expensesData;
      }
      
      // Transform API data to dashboard format
      // ALL records from ExpenseRecords API are expenses (should be red/negative)
      const transformedExpenses = expenseList.map((expense: any) => {
        // Convert all amounts to negative for display (expenses)
        const displayAmount = -Math.abs(expense.amount);
        
        return {
          id: expense.expenseId?.toString() || Date.now().toString(),
          category: getCategoryName(expense.expenseCategoryID),
          icon: getCategoryIcon(expense.expenseCategoryID),
          iconColor: '#FF7A7A', // All expenses are light red
          bgColor: '#2D2D2D',
          amount: displayAmount, // Always negative
          desc: expense.description || 'No description',
          date: formatDate(expense.createdAt),
          originalData: expense, // Keep original data for reference
        };
      });
      
      setExpenses(transformedExpenses);
      
      // Calculate balance - only expenses for now (no income API yet)
      const totalExpense = transformedExpenses
        .reduce((sum: number, exp: any) => sum + Math.abs(exp.amount), 0);
      
      const totalIncome = 0; // No income API yet
      
      setBalance({
        total: totalIncome - totalExpense, // Will be negative
        income: totalIncome,
        expense: totalExpense,
      });
      
      console.log('✅ Dashboard data updated');
    } catch (error: any) {
      console.log('❌ Error fetching expenses:', error);
      
      // Check if it's a 401 error specifically
      if (error.response?.status === 401) {
        console.log('🔒 Authentication failed - token may be expired');
        console.log('💡 Running token diagnostics...');
        
        // Debug token information
        await TokenManager.debugTokens();
        
        // Optional: Clear invalid tokens and redirect to login
        // await TokenManager.clearAllTokens();
        // navigation.navigate('Login');
      }
      
      // Fall back to demo data on error
      setExpenses(demoTransactions);
      setBalance(demoBalance);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to get category name based on ID
  const getCategoryName = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'Food',
      2: 'Hospital',
      3: 'Investment',
      4: 'Rent',
      5: 'Bill',
      6: 'Education',
      7: 'Transport',
      8: 'Entertainment',
      9: 'Utilities',
      10: 'Grocery',
      11: 'Travel',
      12: 'Insurance',
      13: 'Shopping',
      14: 'Loan',
      15: 'Miscellaneous',
      16: 'Credit Card',
    };
    return categoryMap[categoryId] || 'Other';
  };

  // Helper function to get category icon based on ID
  const getCategoryIcon = (categoryId: number): string => {
    const iconMap: { [key: number]: string } = {
      1: 'restaurant',
      2: 'medical',
      3: 'trending-up',
      4: 'home',
      5: 'receipt',
      6: 'school',
      7: 'car',
      8: 'game-controller',
      9: 'flash',
      10: 'basket',
      11: 'airplane',
      12: 'shield',
      13: 'bag',
      14: 'card',
      15: 'ellipsis-horizontal',
      16: 'card',
    };
    return iconMap[categoryId] || 'help';
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  // Function to handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses(false);
  };

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
    fetchExpenses(); // Fetch expenses on component mount
  }, []);

  // Refresh expenses when screen comes into focus (e.g., after adding an expense)
  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses(false); // Refresh without showing loading spinner
    }, [])
  );

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
    console.log('🚪 Starting logout process...');
    
    try {
      // Get current token (could be personal or group token)
      const currentToken = await TokenManager.getCurrentToken();
      if (currentToken) {
        await userAPI.logout(currentToken);
        console.log('✅ Logout API call successful');
      }
    } catch (e) {
      console.log('⚠️ Logout API error (continuing anyway):', e);
    }
    
    // Clear all tokens and data using TokenManager
    await TokenManager.clearAllTokens();
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_GROUPS);
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.APP_SETTINGS);
    
    // Set navigation trigger to force AppNavigator to detect logout
    await AsyncStorage.setItem('@budgetwise_navigation_trigger', Date.now().toString());
    
    console.log('🧹 All data cleared from storage');
    console.log('🔄 AppNavigator will detect logout and switch to auth screens');
  };

  const handleLogoutCancel = () => {
    setLogoutPopup({ visible: false });
  };

  const renderTransaction = ({ item }) => {
    // Dynamic icon rendering based on item.icon
    const renderIcon = () => {
      const iconProps = { size: 22, color: item.iconColor };
      
      switch (item.icon) {
        case 'restaurant': return <MaterialIcons name="restaurant" {...iconProps} />;
        case 'medical': return <MaterialIcons name="local-hospital" {...iconProps} />;
        case 'trending-up': return <MaterialIcons name="trending-up" {...iconProps} />;
        case 'home': return <Ionicons name="home" {...iconProps} />;
        case 'receipt': return <Ionicons name="receipt" {...iconProps} />;
        case 'school': return <Ionicons name="school" {...iconProps} />;
        case 'car': return <Ionicons name="car" {...iconProps} />;
        case 'game-controller': return <Ionicons name="game-controller" {...iconProps} />;
        case 'flash': return <Ionicons name="flash" {...iconProps} />;
        case 'basket': return <Ionicons name="basket" {...iconProps} />;
        case 'airplane': return <Ionicons name="airplane" {...iconProps} />;
        case 'shield': return <Ionicons name="shield" {...iconProps} />;
        case 'bag': return <Ionicons name="bag" {...iconProps} />;
        case 'card': return <Ionicons name="card" {...iconProps} />;
        case 'ellipsis-horizontal': return <Ionicons name="ellipsis-horizontal" {...iconProps} />;
        // Legacy icon support
        case 'heart': return <Ionicons name="heart" {...iconProps} />;
        case 'attach-money': return <MaterialIcons name="attach-money" {...iconProps} />;
        case 'tshirt': return <FontAwesome5 name="tshirt" size={20} color={item.iconColor} />;
        default: return <Ionicons name="help" {...iconProps} />;
      }
    };

    return (
      <View style={[styles.transactionItem, { backgroundColor: '#F8FCFF' }]}>  
        <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '22' }]}>  
          {renderIcon()}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionCategory, { backgroundColor: item.iconColor }]}>{item.category}</Text>
          <Text style={styles.transactionDesc}>{item.desc}</Text>
        </View>
        <View style={styles.transactionMeta}>
          <Text style={[styles.transactionAmount, { color: item.amount > 0 ? '#3ED598' : '#FF7A7A' }]}>
            {item.amount > 0 ? '+' : '-'}₹{Math.abs(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
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

        {/* Context Indicator */}
        <ContextIndicator />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        )}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>₹ {balance.total.toFixed(2)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCol}>
              <Ionicons name="arrow-down" size={18} color="#3ED598" />
              <Text style={styles.incomeLabel}>Income</Text>
              <Text style={styles.incomeValue}>₹{balance.income.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceCol}>
              <Ionicons name="arrow-up" size={18} color="#FF7A7A" />
              <Text style={styles.expenseLabel}>Expense</Text>
              <Text style={styles.expenseValue}>₹{balance.expense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.recentTitle}>Recent Transactions</Text>
        {expenses.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#B0B0B0" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first expense</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable internal scrolling since we have outer ScrollView
          />
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      >
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
    color: '#FF7A7A',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#2C5282',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
