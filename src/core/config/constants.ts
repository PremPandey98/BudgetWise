// API Configuration
export const API_CONFIG = {
  // Your server is running on:
  // HTTP: http://0.0.0.0:5091 
  // HTTPS: https://0.0.0.0:7090
  BASE_URL: __DEV__ 
    ? getDevBaseUrl()  // Dynamic URL based on platform/device
    : 'https://your-production-api.com/api', // Production URL
  TIMEOUT: 30000, // 30 seconds (increased for better network handling)
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to determine the correct API URL for development
function getDevBaseUrl(): string {
  const Platform = require('react-native').Platform;
  
  // Check if running on Android emulator by checking device brand
  const isAndroidEmulator = Platform.OS === 'android' && 
    (Platform.constants as any)?.Brand === 'generic';
  
  let baseIP: string;
  
  if (isAndroidEmulator) {
    // Android Emulator: 10.0.2.2 maps to localhost on the host machine
    baseIP = '10.0.2.2';
  } else if (Platform.OS === 'ios') {
    // For iOS Simulator: localhost works directly
    baseIP = 'localhost';
  } else {
    // For Physical Device: use your computer's IP address
    // Android/iOS physical devices cannot access localhost - need your computer's IP
    baseIP = '192.168.1.238'; // Your computer's actual IP address
  }
  
  return `http://${baseIP}:5091`;
}

// API Endpoints - Updated to match your actual backend
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/login',             // Your existing endpoint
    REGISTER: '/api/User/AddUser',        // Updated to match your backend controller
    LOGOUT: '/api/Auth/logout',           // Your existing endpoint
    REFRESH: '/api/Auth/refresh',
  },
  USER: {
    ADD_USER: '/api/User/AddUser',        // Your existing User endpoint
    PROFILE: '/api/User/profile',
    UPDATE: '/api/User/update',
  },
};

// App Configuration
export const APP_CONFIG = {
  STORAGE_KEYS: {
    USER_DATA: '@budgetwise_user',
    AUTH_TOKEN: '@budgetwise_token',
    REFRESH_TOKEN: '@budgetwise_refresh_token',
  },
};

// Network test function to verify connection
export const testNetworkConnection = async (): Promise<boolean> => {
  try {
    const testUrl = `${API_CONFIG.BASE_URL}/api/Health`;
    console.log('🔍 Testing connection to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
    });
    
    console.log('✅ Connection test successful, status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error);
    
    // Test basic connectivity
    try {
      const basicUrl = getDevBaseUrl();
      console.log('🔍 Testing basic connectivity to:', basicUrl);
      
      const basicResponse = await fetch(basicUrl, {
        method: 'GET',
      });
      
      console.log('✅ Basic connectivity works, server is reachable');
      return true;
    } catch (basicError) {
      console.log('❌ Basic connectivity failed:', basicError);
      return false;
    }
  }
};
