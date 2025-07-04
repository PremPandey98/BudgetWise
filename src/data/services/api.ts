import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../../core/config/constants';
import { User, RegisterRequest, LoginRequest, LoginResponse } from '../../domain/models/User';
import { Platform } from 'react-native';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add request/response interceptors for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data,
      platform: Platform.OS,
    });
    return config;
  },  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },(error: AxiosError) => {
    return Promise.reject(error);
  }
);

// User API service
export const userAPI = {
  // Register a new user - Updated to use User controller
  register: async (userData: RegisterRequest): Promise<User> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile (if needed later)
  getProfile: async (token: string): Promise<User> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile (if needed later)
  updateProfile: async (userData: Partial<User>, token: string): Promise<User> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Switch to group context (get group-specific token)
  switchToGroup: async (groupId: string, currentToken: string): Promise<any> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.AUTH.SWITCH_TO_GROUP}/${groupId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Switch back to personal context (use original personal token)
  switchToPersonal: async (): Promise<any> => {
    // This function will restore the original personal token from storage
    // No API call needed, just token management
    return Promise.resolve({ success: true });
  },

  // Get user details with groups
  getUserDetails: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Group API service
export const groupAPI = {
  // Create a new group
  createGroup: async (groupData: any, token: string): Promise<any> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.GROUP.ADD_GROUP, groupData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add user to group (used for joining existing groups)
  addUserToGroup: async (groupData: any, token: string): Promise<any> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.USER.UPDATE_USER_GROUPS}`, groupData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove user from group
  removeUserFromGroup: async (userId: string, groupId: string, token: string): Promise<any> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.USER.REMOVE_USER_GROUP}/${userId}/${groupId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Expense API service
export const expenseAPI = {
  // Get expense categories
  getExpenseCategories: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSE.GET_CATEGORIES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all expense records
  getAllExpenseRecords: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSE.GET_ALL_EXPENSE_RECORDS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add expense record
  addExpenseRecord: async (expenseData: any, token: string): Promise<any> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EXPENSE.ADD_EXPENSE_RECORD, expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all expense records (context-aware: personal or group)
  getAllRelatedExpenseRecords: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSE.GET_ALL_RELATED_EXPENSE_RECORDS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export the axios instance for more advanced usage if needed
export { apiClient };
