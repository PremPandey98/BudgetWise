import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

interface Props {
  visible: boolean;
  message: string;
  type?: ToastType;
}

export default function CustomToast({ visible, message, type = 'info' }: Props) {
  if (!visible) return null;

  let backgroundColor = '#4A90E2'; // default blue
  if (type === 'success') backgroundColor = '#2ECC71';
  if (type === 'error') backgroundColor = '#E74C3C';

  return (
    <View style={[styles.toast, { backgroundColor }]}> 
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
