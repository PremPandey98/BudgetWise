import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onEmailPress: () => void;
  onWhatsAppPress: () => void;
  title?: string;
  message?: string;
}

export default function ContactMethodsPopup({ 
  visible, 
  onClose, 
  onEmailPress, 
  onWhatsAppPress, 
  title = 'Contact Support',
  message = 'Choose how you would like to contact our support team:'
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: theme.colors.card }]}>
          {/* Header Icon */}
          <View style={[styles.iconContainer, { backgroundColor: '#4A90E2' + '15' }]}>
            <Ionicons name="chatbubble-ellipses" size={48} color="#4A90E2" />
          </View>
          
          {/* Title */}
          <Text style={[styles.title, { color: '#4A90E2' }]}>
            {title}
          </Text>
          
          {/* Message */}
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
          
          {/* Contact Method Buttons */}
          <View style={styles.methodsContainer}>
            {/* WhatsApp Button */}
            <TouchableOpacity 
              style={[styles.methodButton, { backgroundColor: '#25D366' + '15', borderColor: '#25D366' }]} 
              onPress={onWhatsAppPress}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#25D366' }]}>
                <Ionicons name="logo-whatsapp" size={32} color="#fff" />
              </View>
              <Text style={[styles.methodTitle, { color: '#25D366' }]}>WhatsApp</Text>
              <Text style={[styles.methodSubtitle, { color: theme.colors.textSecondary }]}>
                Instant chat support
              </Text>
            </TouchableOpacity>

            {/* Email Button */}
            <TouchableOpacity 
              style={[styles.methodButton, { backgroundColor: '#4A90E2' + '15', borderColor: '#4A90E2' }]} 
              onPress={onEmailPress}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="mail" size={32} color="#fff" />
              </View>
              <Text style={[styles.methodTitle, { color: '#4A90E2' }]}>Email</Text>
              <Text style={[styles.methodSubtitle, { color: theme.colors.textSecondary }]}>
                Detailed support
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
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
    width: 340,
    backgroundColor: '#F8FCFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
    padding: 24,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  methodButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  methodSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
