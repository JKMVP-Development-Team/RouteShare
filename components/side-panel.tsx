// components/side-panel.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
  friendRequestsCount?: number;
}

export function SidePanel({ visible, onClose, friendRequestsCount }: SidePanelProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleInputCode = () => {
    onClose();
    router.push('/input-code-page');
  };

  const handleFriendRequests = () => {
    onClose();
    router.push('/friend-request-page');
  }; 

  const handleCalendar = () => {
    onClose();
    router.push('/calendar-page');
  }

  const handleProfile = () => {
    onClose();
    router.push('/profile');
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <ThemedView style={styles.panel}>
              {/* Header */}
              <View style={styles.panelHeader}>
                <ThemedText type="title" style={styles.panelTitle}>
                  Menu
                </ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Profile Section */}
              <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="person.circle" size={24} color={colors.tint} />
                  <ThemedText style={styles.menuItemText}>My Profile</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.icon} />
              </TouchableOpacity>

              {/* Calendar Menu Item - */}
              <TouchableOpacity style={styles.menuItem} onPress={handleCalendar}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="calendar" size={24} color={colors.tint} />
                  <ThemedText style={styles.menuItemText}>My Schedule</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.icon} />
              </TouchableOpacity>

              {/* Input Code Section */}
              <TouchableOpacity style={styles.menuItem} onPress={handleInputCode}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="qrcode" size={24} color={colors.tint} />
                  <ThemedText style={styles.menuItemText}>Input Code</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.icon} />
              </TouchableOpacity>

              {/* Friend Requests Section */}
              <TouchableOpacity style={styles.menuItem} onPress={handleFriendRequests}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="person.2" size={24} color={colors.tint} />
                  <ThemedText style={styles.menuItemText}>Friend Requests</ThemedText>
                </View>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{friendRequestsCount}</ThemedText>
                </View>
              </TouchableOpacity>

              {/* Settings Menu Item */}
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="gear" size={24} color={colors.tint} />
                  <ThemedText style={styles.menuItemText}>Settings</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.icon} />
              </TouchableOpacity>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  panel: {
    width: 300,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});