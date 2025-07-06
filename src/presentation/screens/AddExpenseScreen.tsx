import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../core/config/constants';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import { expenseAPI, depositAPI } from '../../data/services/api';

export default function AddExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState<'expense' | 'credit'>('expense'); // expense or credit
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>(
    { visible: false, message: '', type: 'info' }
  );
  
  const navigation = useNavigation();

  const showPopup = (message: string, type: PopupType = 'info') => setPopup({ visible: true, message, type });
  
  const closePopup = () => {
    const currentType = popup.type;
    setPopup(p => ({ ...p, visible: false }));
    // Navigate back only after closing success popup
    if (currentType === 'success') {
      navigation.goBack();
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      showPopup('Please enter a title', 'error');
      return false;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      showPopup('Please enter a valid amount', 'error');
      return false;
    }
    // Category is only required for expenses, not deposits
    if (type === 'expense' && !categoryId && !category.trim()) {
      showPopup('Please select a category', 'error');
      return false;
    }
    return true;
  };

  const handleSaveExpense = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use TokenManager to get current context token (personal or group)
      const { TokenManager } = await import('../../data/TokenManager');
      const token = await TokenManager.getCurrentToken();

      if (!token) {
        showPopup('Authentication token missing. Please login again.', 'error');
        return;
      }

      // Get user data and active group for local storage
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      const activeGroupData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACTIVE_GROUP);
      
      if (!userData) {
        showPopup('User session expired. Please login again.', 'error');
        return;
      }

      const user = JSON.parse(userData);
      const activeGroup = activeGroupData ? JSON.parse(activeGroupData) : null;

      if (type === 'expense') {
        // Handle expense creation
        const selectedCategoryId = categoryId || (categories.find(cat => cat.name === category)?.id) || 1;
        
        console.log('🏷️ Selected category ID:', selectedCategoryId, 'for category:', category);
        console.log('💰 Adding expense with amount:', amount);
        
        const expenseAmount = Math.abs(Number(amount));
        
        const expenseData = {
          amount: expenseAmount,
          description: description.trim() || title.trim(),
          expenseCategoryID: selectedCategoryId,
          Tittle: title.trim(), // Note: API uses "Tittle" (with double t)
        };

        console.log('💰 Creating expense via API:', expenseData);
        const response = await expenseAPI.addExpenseRecord(expenseData, token);
        console.log('✅ Expense created successfully:', response);

        // Save to local storage
        const localExpenseData = {
          id: response.id || Date.now().toString(),
          title: title.trim(),
          amount: -Math.abs(Number(amount)), // Negative for expenses
          description: description.trim(),
          category: category.trim(),
          type: type,
          userId: user.userId,
          groupId: activeGroup ? activeGroup.id : null,
          groupCode: activeGroup ? activeGroup.groupCode : null,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          apiResponse: response,
        };

        const storageKey = activeGroup 
          ? `${APP_CONFIG.STORAGE_KEYS.GROUP_EXPENSES_PREFIX}${activeGroup.id}`
          : APP_CONFIG.STORAGE_KEYS.PERSONAL_EXPENSES;

        const existingExpenses = await AsyncStorage.getItem(storageKey);
        const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
        expenses.unshift(localExpenseData);
        await AsyncStorage.setItem(storageKey, JSON.stringify(expenses));

        showPopup(`Expense "${title}" added successfully!`, 'success');

      } else {
        // Handle deposit creation
        console.log('💰 Adding deposit with amount:', amount);
        
        const depositAmount = Math.abs(Number(amount));
        
        const depositData = {
          amount: depositAmount,
          description: description.trim() || title.trim(),
          tittle: title.trim(), // Note: API uses "tittle" (lowercase)
        };

        console.log('💰 Creating deposit via API:', depositData);
        const response = await depositAPI.addDeposit(depositData, token);
        console.log('✅ Deposit created successfully:', response);

        // Save to local storage (you might want to use a separate storage key for deposits)
        const localDepositData = {
          id: response.id || Date.now().toString(),
          title: title.trim(),
          amount: Math.abs(Number(amount)), // Positive for deposits
          description: description.trim(),
          category: 'Deposit', // Default category for deposits
          type: type,
          userId: user.userId,
          groupId: activeGroup ? activeGroup.id : null,
          groupCode: activeGroup ? activeGroup.groupCode : null,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          apiResponse: response,
        };

        const storageKey = activeGroup 
          ? `${APP_CONFIG.STORAGE_KEYS.GROUP_EXPENSES_PREFIX}${activeGroup.id}`
          : APP_CONFIG.STORAGE_KEYS.PERSONAL_EXPENSES;

        const existingExpenses = await AsyncStorage.getItem(storageKey);
        const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
        expenses.unshift(localDepositData);
        await AsyncStorage.setItem(storageKey, JSON.stringify(expenses));

        showPopup(`Deposit "${title}" added successfully!`, 'success');
      }

    } catch (error: any) {
      console.log('❌ Error saving:', error);
      
      let errorMessage = 'Failed to save. Please try again.';
      if (error.response) {
        errorMessage = `API Error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showPopup(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(false);
    try {
      // Use TokenManager to get current context token (personal or group)
      const { TokenManager } = await import('../../data/TokenManager');
      const token = await TokenManager.getCurrentToken();
      
      if (token) {
        console.log('🔍 Fetching expense categories from API...');
        const categoriesData = await expenseAPI.getExpenseCategories(token);
        console.log('✅ Categories loaded:', categoriesData);
          
        // Handle the API response structure with $values
        let categoryList = [];
        if (categoriesData && categoriesData.$values) {
          // Map the API response to our expected format
          categoryList = categoriesData.$values.map((cat: any) => ({
            id: cat.expenseCategoryID,
            name: cat.expenseCategoryName
          }));
        } else if (Array.isArray(categoriesData)) {
          categoryList = categoriesData;
        } else {
          categoryList = categoriesData.data || [];
        }
        
        console.log('🔄 Processed categories:', categoryList);
        setCategories(categoryList);
        
        if (categoryList.length > 0) {
          console.log('✅ Categories set successfully, count:', categoryList.length);
        } else {
          console.log('⚠️ No categories processed from API response');
        }
      }
    } catch (error) {
      console.log('❌ Error loading categories:', error);
      setCategoriesError(true);
      // Fallback to hardcoded categories that match API structure
      const fallbackCategories = [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Hospital' },
        { id: 3, name: 'Investment' },
        { id: 4, name: 'Rent' },
        { id: 5, name: 'Bill' },
        { id: 6, name: 'Education' },
        { id: 7, name: 'Transport' },
        { id: 8, name: 'Entertainment' },
        { id: 9, name: 'Utilities' },
        { id: 10, name: 'Grocery' },
        { id: 11, name: 'Travel' },
        { id: 12, name: 'Insurance' },
        { id: 13, name: 'Shopping' },
        { id: 14, name: 'Loan' },
        { id: 15, name: 'Miscellaneous' },
        { id: 16, name: 'creditCardBill' },
      ];
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load categories when component mounts or when type changes to expense
  useEffect(() => {
    if (type === 'expense') {
      loadCategories();
    }
  }, [type]);

  return (
    <>
      <CustomPopup visible={popup.visible} message={popup.message} type={popup.type} onClose={closePopup} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#2C5282" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {type === 'expense' ? 'Add Expense' : 'Add Deposit'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Type Selector - Only Expense for now */}
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Ionicons 
                name="remove-circle" 
                size={20} 
                color={type === 'expense' ? '#fff' : '#FF4C5E'} 
              />
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'credit' && styles.typeButtonActive]}
              onPress={() => setType('credit')}
            >
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={type === 'credit' ? '#fff' : '#00C897'} 
              />
              <Text style={[styles.typeButtonText, type === 'credit' && styles.typeButtonTextActive]}>
                Deposit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={type === 'expense' ? "remove-circle" : "add-circle"} 
                size={40} 
                color={type === 'expense' ? "#FF4C5E" : "#00C897"} 
              />
            </View>
            
            <Text style={styles.title}>
              {type === 'expense' ? 'Record Expense' : 'Record Deposit'}
            </Text>
            <Text style={styles.subtitle}>
              {type === 'expense' 
                ? 'Track your spending and manage your budget'
                : 'Track your income and deposits'
              }
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder={type === 'expense' ? "e.g. Lunch at restaurant" : "e.g. Salary payment"}
                placeholderTextColor="#B0B0B0"
                value={title}
                onChangeText={setTitle}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#B0B0B0"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            </View>

            {type === 'expense' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Category * {categories.length > 0 && `(${categories.length} available)`}
                </Text>
                {categoriesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : categoriesError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load categories</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
                      <Ionicons name="refresh" size={16} color="#4A90E2" />
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                        onPress={() => {
                          setCategory(cat.name);
                          setCategoryId(cat.id);
                        }}
                      >
                        <Text style={[styles.categoryChipText, categoryId === cat.id && styles.categoryChipTextActive]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={type === 'expense' ? "Add notes or details (optional)" : "Add deposit details (optional)"}
                placeholderTextColor="#B0B0B0"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
                returnKeyType="done"
                onSubmitEditing={handleSaveExpense}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton, 
                loading && styles.buttonDisabled,
                type === 'credit' && styles.creditButton
              ]} 
              onPress={handleSaveExpense}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={type === 'expense' ? "remove-circle" : "add-circle"} 
                    size={20} 
                    color="#fff" 
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.saveButtonText}>
                    Save {type === 'expense' ? 'Expense' : 'Credit'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F0F8FF',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  placeholder: {
    width: 40,
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#2C5282',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    paddingLeft: 16,
  },
  amountInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#2C5282',
  },
  categoryScroll: {
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB5B5',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4C5E',
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  retryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  categoryChip: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#2C5282',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    height: 55,
    backgroundColor: '#FF4C5E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    shadowColor: '#FF4C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  creditButton: {
    backgroundColor: '#00C897',
    shadowColor: '#00C897',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
