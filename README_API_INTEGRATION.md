# BudgetWise App - API Integration Setup

## Project Structure
The project follows a clean folder structure with all API logic centralized in the data layer:

```
/src
├── /presentation
│   ├── /screens
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── DashboardScreen.tsx
│   └── /navigation
│       └── AppNavigator.tsx
├── /domain
│   └── /models
│       └── User.ts
├── /data
│   └── /services
│       └── api.ts
└── /core
    └── /config
        └── constants.ts
```

## Key Features Implemented

### 1. API Configuration (`src/core/config/constants.ts`)
- Centralized API configuration with base URL
- Endpoint definitions for authentication
- Headers and timeout settings
- Storage keys for future use

### 2. API Service (`src/data/services/api.ts`)
- Axios-based HTTP client setup
- User registration and login methods
- Proper error handling and logging
- Extensible for future API endpoints

### 3. User Models (`src/domain/models/User.ts`)
- User interface definition
- RegisterRequest interface for registration data
- LoginRequest interface for login credentials
- TypeScript interfaces for type safety

### 4. Screen Integration
- **RegisterScreen**: Full form validation and API integration
- **LoginScreen**: Simple login form with API calls
- Error handling with user-friendly messages
- Loading states for better UX

## API Endpoints
The app is configured to work with these endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Usage Instructions

### For Registration:
1. User fills out the registration form
2. Frontend validates all fields
3. Calls `userAPI.register()` with user data
4. Handles success/error responses appropriately

### For Login:
1. User enters email and password
2. Frontend validates required fields
3. Calls `userAPI.login()` with credentials
4. Navigates to Dashboard on success

## Key Benefits
- ✅ Simple and clean architecture
- ✅ All API logic centralized in one place
- ✅ Easy to maintain and extend
- ✅ TypeScript support for type safety
- ✅ Proper error handling
- ✅ No unnecessary complexity

## Backend API Requirements
Your backend should accept:
- Registration: POST request with Name, UserName, Email, Password, Phone, Role
- Login: POST request with Email, Password
- Return user object on successful authentication

## Next Steps
1. Update the API_CONFIG.BASE_URL in constants.ts to match your backend
2. Implement AsyncStorage for token persistence
3. Add authentication middleware for protected routes
4. Extend API service for additional endpoints as needed
