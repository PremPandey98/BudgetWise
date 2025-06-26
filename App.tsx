import React from 'react';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

// Suppress console errors in production-like experience
if (!__DEV__) {
  console.error = () => {};
  console.warn = () => {};
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
