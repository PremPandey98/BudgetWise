import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type PopupType = 'success' | 'error' | 'info' | 'confirm';

interface Props {
  visible: boolean;
  message: string;
  type?: PopupType;
  onClose: () => void;
  onConfirm?: () => void; // For confirmation dialogs
}

export default function CustomPopup({ visible, message, type = 'info', onClose, onConfirm }: Props) {
  let backgroundColor = '#4A90E2'; // default blue
  if (type === 'success') backgroundColor = '#2ECC71';
  if (type === 'error') backgroundColor = '#E74C3C';
  if (type === 'confirm') backgroundColor = '#FF6B35'; // orange for confirmation

  const isConfirmation = type === 'confirm';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { borderColor: backgroundColor }]}>
          <Text style={[styles.title, { color: backgroundColor }]}>
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'confirm' ? 'Confirm' : 'Info'}
          </Text>
          <Text style={styles.message}>{message}</Text>
          
          {isConfirmation ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor }, { flex: 1 }]} onPress={onConfirm}>
                <Text style={styles.buttonText}>Logout</Text>
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
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 22,
  },  button: {
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flex: 1,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
