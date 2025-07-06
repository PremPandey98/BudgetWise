import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { expenseAPI, depositAPI } from '../../data/services/api';
import { TokenManager } from '../../data/TokenManager';
import CustomPopup, { PopupType } from '../components/CustomPopup';
import ContextIndicator from '../components/ContextIndicator';

interface Transaction {
  id: number | string;
  type: 'expense' | 'deposit';
  amount: number;
  description: string;
  category?: string;
  categoryId?: number;
  date: string;
  dateTime?: string;
  originalData?: any; // Store original backend data for updates
}

type FilterType = 'all' | 'expenses' | 'deposits';

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [popup, setPopup] = useState<{visible: boolean, message: string, type: PopupType}>({
    visible: false, message: '', type: 'info'
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(true); // Track API connection status

  // Category mapping function
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

  const fetchTransactions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const token = await TokenManager.getCurrentToken();
      if (!token) {
        showPopup('Please login to view transactions', 'error');
        setIsApiConnected(false);
        return;
      }

      // Fetch both expenses and deposits
      const [expensesResponse, depositsResponse] = await Promise.all([
        expenseAPI.getAllRelatedExpenseRecords(token),
        depositAPI.getAllRelatedDeposits(token)
      ]);

      // If we reach here, API is connected
      setIsApiConnected(true);

      // Process expenses
      let expensesList = [];
      if (expensesResponse && expensesResponse.$values) {
        expensesList = expensesResponse.$values;
      } else if (Array.isArray(expensesResponse)) {
        expensesList = expensesResponse;
      }

      // Process deposits
      let depositsList = [];
      if (depositsResponse && depositsResponse.$values) {
        depositsList = depositsResponse.$values;
      } else if (Array.isArray(depositsResponse)) {
        depositsList = depositsResponse;
      }

      // Convert to unified transaction format
      const expenseTransactions: Transaction[] = expensesList.map((expense, index) => {
        // Try to get the correct ID field (prioritize common ASP.NET Core naming)
        let expenseId = expense.expenseId || expense.id || expense.expenseID || expense.ExpenseId || expense.ExpenseID;
        
        // Convert string IDs to numbers if possible
        if (typeof expenseId === 'string' && !isNaN(Number(expenseId))) {
          expenseId = Number(expenseId);
        }
        
        // Only fallback to generated ID if no valid ID found
        if (!expenseId) {
          expenseId = `expense_${index}_${Date.now()}`;
          console.log(`⚠️ No valid ID found for expense ${index}, using fallback ID`);
        }

        return {
          id: expenseId,
          type: 'expense' as const,
          amount: Math.abs(expense.amount),
          description: expense.description || 'No description',
          categoryId: expense.expenseCategoryID || expense.categoryId,
          category: getCategoryName(expense.expenseCategoryID || expense.categoryId),
          date: expense.dateTime || expense.date || new Date().toISOString(),
          dateTime: expense.dateTime || expense.date,
          originalData: expense, // Store original data for updates
        };
      });

      const depositTransactions: Transaction[] = depositsList.map((deposit, index) => {
        // Try to get the correct ID field (prioritize common ASP.NET Core naming)
        let depositId = deposit.depositId || deposit.id || deposit.depositID || deposit.DepositId || deposit.DepositID;
        
        // Convert string IDs to numbers if possible
        if (typeof depositId === 'string' && !isNaN(Number(depositId))) {
          depositId = Number(depositId);
        }
        
        // Only fallback to generated ID if no valid ID found
        if (!depositId) {
          depositId = `deposit_${index}_${Date.now()}`;
          console.log(`⚠️ No valid ID found for deposit ${index}, using fallback ID`);
        }

        return {
          id: depositId,
          type: 'deposit' as const,
          amount: deposit.amount,
          description: deposit.description || 'Deposit',
          date: deposit.dateTime || deposit.date || new Date().toISOString(),
          dateTime: deposit.dateTime || deposit.date,
          originalData: deposit, // Store original data for updates
        };
      });

      // Combine and sort by date (newest first)
      const allTransactions = [...expenseTransactions, ...depositTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);

    } catch (error: any) {
      console.error('❌ Error fetching transactions:', error);
      
      // Check if it's a network/API connection error
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || 
          error.response === undefined || error.code === 'ECONNREFUSED') {
        setIsApiConnected(false);
        showPopup('Unable to connect to server. Showing offline data.', 'error');
        // Could load cached/local data here if available
      } else {
        setIsApiConnected(true); // API is running but other error occurred
        showPopup('Failed to load transactions', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and search transactions
  useEffect(() => {
    let filtered = transactions;

    // Apply type filter
    if (filterType === 'expenses') {
      filtered = filtered.filter(t => t.type === 'expense');
    } else if (filterType === 'deposits') {
      filtered = filtered.filter(t => t.type === 'deposit');
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.amount.toString().includes(query) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions(false);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(false);
  };

  const showPopup = (message: string, type: PopupType = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const handleEdit = (transaction: Transaction) => {
    // Check API connection first
    if (!isApiConnected) {
      showPopup('Cannot edit transactions while offline', 'error');
      return;
    }

    // Only allow editing for transactions with numeric IDs (real database records)
    if (typeof transaction.id !== 'number') {
      showPopup('Cannot edit this transaction - not synced with server', 'info');
      return;
    }

    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingTransaction) return;

    // Only allow updates for transactions with numeric IDs (real database records)
    if (typeof editingTransaction.id !== 'number') {
      showPopup('Cannot update this transaction', 'error');
      return;
    }

    try {
      const token = await TokenManager.getCurrentToken();
      if (!token) {
        showPopup('Authentication required', 'error');
        return;
      }

      // Create update data based on transaction type
      let updatedData;
      
      if (editingTransaction.type === 'expense') {
        // Start with original data and update only the changed fields
        updatedData = {
          ...editingTransaction.originalData,
          ExpenseId: editingTransaction.id,
          Amount: parseFloat(editAmount),
          Description: editDescription,
        };
        
        console.log('🔄 Updating expense:', updatedData);
        await expenseAPI.updateExpense(editingTransaction.id, updatedData, token);
      } else {
        // Start with original data and update only the changed fields
        // Ensure we include the Tittle field if it exists in original data
        updatedData = {
          ...editingTransaction.originalData,
          DepositId: editingTransaction.id,
          Amount: parseFloat(editAmount),
          Description: editDescription,
          // Include Tittle if it exists in original data or use description as fallback
          Tittle: editingTransaction.originalData?.Tittle || 
                  editingTransaction.originalData?.tittle || 
                  editDescription ||
                  'Deposit',
        };
        
        console.log('🔄 Updating deposit:', updatedData);
        await depositAPI.updateDeposit(editingTransaction.id, updatedData, token);
      }

      setEditModalVisible(false);
      setEditingTransaction(null);
      showPopup('Transaction updated successfully', 'success');
      fetchTransactions(false);

    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data || 'Failed to update transaction';
      showPopup(errorMessage, 'error');
    }
  };

  const handleDelete = (transaction: Transaction) => {
    // Check API connection first
    if (!isApiConnected) {
      showPopup('Cannot delete transactions while offline', 'error');
      return;
    }

    // Only allow deletion for transactions with numeric IDs (real database records)
    if (typeof transaction.id !== 'number') {
      showPopup('Cannot delete this transaction - not synced with server', 'error');
      return;
    }

    setTransactionToDelete(transaction);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const token = await TokenManager.getCurrentToken();
      if (!token) {
        showPopup('Authentication required', 'error');
        return;
      }

      if (transactionToDelete.type === 'expense') {
        await expenseAPI.deleteExpense(transactionToDelete.id as number, token);
      } else {
        await depositAPI.deleteDeposit(transactionToDelete.id as number, token);
      }

      setDeleteModalVisible(false);
      setTransactionToDelete(null);
      showPopup('Transaction deleted successfully', 'success');
      fetchTransactions(false);

    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      showPopup('Failed to delete transaction', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const canEdit = typeof item.id === 'number';
    const isFromDatabase = typeof item.id === 'number';
    const isExpense = item.type === 'expense';
    
    return (
      <View style={styles.transactionCard}>
        {/* Left Color Accent */}
        <View style={[
          styles.colorAccent,
          { backgroundColor: isExpense ? '#FF4757' : '#2ED573' }
        ]} />
        
        <View style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.mainInfo}>
              {/* Transaction Icon */}
              <View style={[
                styles.transactionIcon,
                { backgroundColor: isExpense ? '#FFE8EA' : '#E8F8F5' }
              ]}>
                <Ionicons 
                  name={isExpense ? 'remove-circle' : 'add-circle'} 
                  size={24} 
                  color={isExpense ? '#FF4757' : '#2ED573'} 
                />
              </View>
              
              {/* Transaction Details */}
              <View style={styles.transactionDetails}>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.timeText}>{formatTime(item.date)}</Text>
                  {item.category && (
                    <>
                      <Text style={styles.metaSeparator}>•</Text>
                      <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
            
            {/* Status Indicator */}
            <View style={styles.statusIndicator}>
              {!isApiConnected ? (
                <View style={styles.statusColumn}>
                  <Ionicons name="cloud-offline-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.statusIndicatorText, { color: '#FF6B6B' }]}>Offline</Text>
                </View>
              ) : isFromDatabase ? (
                <View style={styles.statusColumn}>
                  <Ionicons name="cloud-done-outline" size={20} color="#2ED573" />
                  <Text style={[styles.statusIndicatorText, { color: '#2ED573' }]}>Synced</Text>
                </View>
              ) : (
                <View style={styles.statusColumn}>
                  <Ionicons name="time-outline" size={20} color="#FFA502" />
                  <Text style={[styles.statusIndicatorText, { color: '#FFA502' }]}>Pending</Text>
                </View>
              )}
            </View>
          </View>

          {/* Amount Row */}
          <View style={styles.amountRow}>
            <Text style={[
              styles.amount,
              { color: isExpense ? '#FF4757' : '#2ED573' }
            ]}>
              {isExpense ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.editButton,
                (!canEdit || !isApiConnected) && styles.disabledButton
              ]}
              onPress={() => handleEdit(item)}
              disabled={!canEdit || !isApiConnected}
            >
              <Ionicons 
                name="create-outline" 
                size={18} 
                color={(!canEdit || !isApiConnected) ? "#A0A0A0" : "#007AFF"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: (!canEdit || !isApiConnected) ? "#A0A0A0" : "#007AFF" }
              ]}>
                Edit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.deleteButton,
                (!canEdit || !isApiConnected) && styles.disabledButton
              ]}
              onPress={() => handleDelete(item)}
              disabled={!canEdit || !isApiConnected}
            >
              <Ionicons 
                name="trash-outline" 
                size={18} 
                color={(!canEdit || !isApiConnected) ? "#A0A0A0" : "#FF3B30"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: (!canEdit || !isApiConnected) ? "#A0A0A0" : "#FF3B30" }
              ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>Manage your expenses and deposits</Text>
        </View>

        {/* Context Indicator */}
        <ContextIndicator />

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#4A90E2" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'expenses' && styles.activeFilter]}
            onPress={() => setFilterType('expenses')}
          >
            <Text style={[styles.filterText, filterType === 'expenses' && styles.activeFilterText]}>
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'deposits' && styles.activeFilter]}
            onPress={() => setFilterType('deposits')}
          >
            <Text style={[styles.filterText, filterType === 'deposits' && styles.activeFilterText]}>
              Deposits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#B0B0B0" />
              <Text style={styles.emptyStateText}>No transactions found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Start by adding some expenses or deposits'}
              </Text>
            </View>
          }
        />

        {/* Add Transaction Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense' as never)}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {editingTransaction && (
              <View style={styles.transactionTypeHeader}>
                <Ionicons 
                  name={editingTransaction.type === 'expense' ? 'remove-circle' : 'add-circle'} 
                  size={20} 
                  color={editingTransaction.type === 'expense' ? '#FF6B6B' : '#34C759'} 
                />
                <Text style={[
                  styles.transactionTypeText,
                  { color: editingTransaction.type === 'expense' ? '#FF6B6B' : '#34C759' }
                ]}>
                  Editing {editingTransaction.type === 'expense' ? 'Expense' : 'Deposit'}
                </Text>
              </View>
            )}
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.descriptionInput]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.deleteModalContainer]}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={48} color="#FF6B6B" />
            </View>
            
            <Text style={styles.deleteModalTitle}>Delete Transaction</Text>
            
            {transactionToDelete && (
              <View style={styles.deleteTransactionInfo}>
                <Text style={styles.deleteModalText}>
                  Are you sure you want to delete this {transactionToDelete.type}?
                </Text>
                <View style={styles.deleteTransactionDetails}>
                  <Text style={styles.deleteTransactionAmount}>
                    ₹{transactionToDelete.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.deleteTransactionDescription}>
                    {transactionToDelete.description}
                  </Text>
                </View>
              </View>
            )}
            
            <Text style={styles.deleteWarningText}>
              This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomPopup
        visible={popup.visible}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />
    </>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#4A90E2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E6F3FF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C5282',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  colorAccent: {
    width: 4,
    backgroundColor: '#4A90E2',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mainInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusColumn: {
    alignItems: 'center',
    gap: 4,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  amountRow: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusText: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButton: {
    backgroundColor: '#EBF4FF',
    borderColor: '#93C5FD',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C5282',
  },
  closeButton: {
    padding: 4,
  },
  transactionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  transactionTypeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2C5282',
    paddingVertical: 12,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C5282',
    backgroundColor: '#F8F9FA',
  },
  descriptionInput: {
    minHeight: 80,
    maxHeight: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Delete Modal Styles
  deleteModalContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  deleteIconContainer: {
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C5282',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteTransactionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteTransactionDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  deleteTransactionAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  deleteTransactionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  deleteWarningText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  deleteConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
