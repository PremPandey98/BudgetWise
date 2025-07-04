# BudgetWise App

A modern, cross-platform budgeting app built with React Native and Expo.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd BudgetWise
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm start
   # or
   expo start
   # npx expo start
   ```
4. **Run on your device:**
   - Use the Expo Go app (Android/iOS) to scan the QR code.
   - Or run on an emulator/simulator from the Expo Dev Tools.

### Environment Variables
- If your project uses environment variables, create a `.env` file in the root directory. This file is ignored by git.

### Project Structure
```
BudgetWise/
  assets/           # App icons, splash, etc.
  src/              # Source code
    core/           # App config/constants
    data/           # API services
    domain/         # Models, interfaces
    presentation/   # Screens, navigation, components
    utils/          # Utilities
  App.tsx           # App entry point
  app.json          # Expo config
  package.json      # Project metadata
```

## 📦 Scripts
- `npm start` – Start Expo development server
- `npm run android` – Run on Android device/emulator
- `npm run ios` – Run on iOS simulator
- `npm run web` – Run in web browser

## 📝 Notes
- `node_modules/`, `.expo/`, `.env`, and other system/editor files are ignored by git (see `.gitignore`).
- For backend/API integration, see `README_API_INTEGRATION.md`.

## 📄 License
MIT
