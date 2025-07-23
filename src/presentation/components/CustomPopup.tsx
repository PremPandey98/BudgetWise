import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PopupType = 'success' | 'error' | 'info' | 'confirm' | 'biometric-error' | 'biometric-retry' | 'warning';

interface Props {
  visible: boolean;
  message: string;
  type?: PopupType;
  onClose: () => void;
  onConfirm?: () => void; // For confirmation dialogs
  onRetry?: () => void; // For retry dialogs
  title?: string; // Custom title
  confirmText?: string; // Custom confirm button text
}

export default function CustomPopup({ visible, message, type = 'info', onClose, onConfirm, onRetry, title, confirmText }: Props) {
  let backgroundColor = '#4A90E2'; // default blue
  let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';
  let defaultTitle = 'Info';

  if (type === 'success') {
    backgroundColor = '#3ED598';
    iconName = 'checkmark-circle';
    defaultTitle = 'Success';
  } else if (type === 'error') {
    backgroundColor = '#FF7A7A';
    iconName = 'close-circle';
    defaultTitle = 'Error';
  } else if (type === 'confirm') {
    backgroundColor = '#FF6B35';
    iconName = 'help-circle';
    defaultTitle = 'Confirm';
  } else if (type === 'biometric-error') {
    backgroundColor = '#FF7A7A';
    iconName = 'finger-print';
    defaultTitle = 'Authentication Failed';
  } else if (type === 'biometric-retry') {
    backgroundColor = '#FF6B35';
    iconName = 'refresh-circle';
    defaultTitle = 'Retry Authentication';
  } else if (type === 'warning') {
    backgroundColor = '#FFB84D';
    iconName = 'warning';
    defaultTitle = 'Warning';
  }

  const finalTitle = title || defaultTitle;
  const isConfirmation = type === 'confirm';
  const isBiometricRetry = type === 'biometric-retry';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { borderColor: backgroundColor }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: backgroundColor + '15' }]}>
            <Ionicons name={iconName} size={48} color={backgroundColor} />
          </View>
          
          {/* Title */}
          <Text style={[styles.title, { color: backgroundColor }]}>
            {finalTitle}
          </Text>
          
          {/* Message */}
          <Text style={styles.message}>{message}</Text>
          
          {/* Buttons */}
          {isConfirmation ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor }, { flex: 1 }]} onPress={onConfirm}>
                <Text style={styles.buttonText}>{confirmText || 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          ) : isBiometricRetry ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor }, { flex: 1 }]} onPress={onRetry}>
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onClose}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,82,130,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: 320,
    backgroundColor: '#F8FCFF',
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },  button: {
    minWidth: 120,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    gap: 16,
  },
  cancelButton: {
    backgroundColor: '#E6F3FF',
    borderWidth: 2,
    borderColor: '#4A90E2',
    flex: 1,
  },
  cancelButtonText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
