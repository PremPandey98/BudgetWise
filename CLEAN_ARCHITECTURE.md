# BudgetWise - Clean Architecture Implementation

## 📁 Project Structure

```
src/
├── core/                    # Core Layer (Cross-cutting concerns)
│   ├── config/
│   │   └── constants.ts     # App configuration and constants
│   └── di/
│       └── DIContainer.ts   # Dependency Injection container
├── data/                    # Data Layer (External interfaces)
│   ├── repositories/        # Repository implementations
│   │   └── ApiUserRepository.ts
│   └── services/
│       └── api.ts          # HTTP client service
├── domain/                  # Domain Layer (Business logic)
│   ├── entities/           # Business entities/models
│   │   └── User.ts
│   ├── repositories/       # Repository interfaces
│   │   └── UserRepository.ts
│   ├── usecases/          # Business use cases
│   │   ├── RegisterUserUseCase.ts
│   │   └── LoginUserUseCase.ts
│   └── models/            # Legacy models (for backward compatibility)
│       └── User.ts
└── presentation/           # Presentation Layer (UI)
    ├── navigation/
    │   └── AppNavigator.tsx
    └── screens/
        ├── HomeScreen.tsx
        ├── LoginScreen.tsx
        ├── RegisterScreen.tsx
        └── DashboardScreen.tsx
```

## 🏗️ Clean Architecture Layers

### 1. **Domain Layer** (Business Logic)
- **Entities**: Core business objects (User)
- **Repository Interfaces**: Contracts for data access
- **Use Cases**: Business logic and application rules for authentication
- **No dependencies on external frameworks**

### 2. **Data Layer** (External Interfaces)
- **Repository Implementations**: API-specific data access for user management
- **API Services**: HTTP client configuration
- **DTOs**: Data transfer objects for API communication
- **Depends only on Domain layer**

### 3. **Presentation Layer** (UI)
- **Screens**: React Native UI components (Home, Login, Register, Dashboard)
- **Navigation**: App routing and navigation
- **Uses Use Cases through Dependency Injection**
- **Depends on Domain layer only**

### 4. **Core Layer** (Cross-cutting)
- **Configuration**: App constants and settings
- **Dependency Injection**: DI container for managing dependencies
- **Shared utilities and helpers**

## 🔄 Data Flow

```
UI Screen → Use Case → Repository Interface → Repository Implementation → API Service
    ↓
User Input → Business Logic → Data Contract → Data Access → Your Backend API
```

## 🎯 Current Features

### ✅ **User Authentication**
- User registration with validation
- User login functionality
- Clean architecture implementation
- API integration with your backend

### ✅ **UI Components**
- Beautiful home screen with app description
- User-friendly registration form
- Clean login interface
- Demo dashboard with logout functionality

## 🚀 Usage Examples

### Registration Flow
```typescript
// In RegisterScreen.tsx
const diContainer = DIContainer.getInstance();
const registerUserUseCase = diContainer.registerUserUseCase;

// Use case handles validation and business logic
const user = await registerUserUseCase.execute(userRequest);
```

### Login Flow
```typescript
// In LoginScreen.tsx
const diContainer = DIContainer.getInstance();
const loginUserUseCase = diContainer.loginUserUseCase;

// Use case handles validation and business logic
const user = await loginUserUseCase.execute(credentials);
```

## 🔧 Key Features

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Validation**: Business rules in use cases
- **API Integration**: RESTful API communication with your backend
- **Dependency Injection**: Centralized dependency management
- **Clean Interfaces**: Abstract repository contracts

## 📝 Adding New Features

1. **Add Entity** (if needed) in `domain/entities/`
2. **Define Repository Interface** in `domain/repositories/`
3. **Create Use Case** in `domain/usecases/`
4. **Implement Repository** in `data/repositories/`
5. **Update DI Container** to inject dependencies
6. **Use in Presentation Layer** via DI Container

This clean architecture ensures your BudgetWise app is maintainable, testable, and ready for future enhancements! 🎉
