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
};

// Export the axios instance for more advanced usage if needed
export { apiClient };
