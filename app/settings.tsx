// app/settings.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    autoJoinTrips: false,
    darkMode: colorScheme === 'dark',
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(tabs)') }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Notifications</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="bell.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Push Notifications</ThemedText>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => handleSettingChange('notifications', value)}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="car.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Trip Updates</ThemedText>
            </View>
            <Switch
              value={settings.autoJoinTrips}
              onValueChange={(value) => handleSettingChange('autoJoinTrips', value)}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Privacy</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="location.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Location Sharing</ThemedText>
            </View>
            <Switch
              value={settings.locationSharing}
              onValueChange={(value) => handleSettingChange('locationSharing', value)}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="lock.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Privacy Settings</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Appearance</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="moon.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Support</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="questionmark.circle.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Help & Support</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="envelope.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Contact Us</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="info.circle.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>About</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="person.fill" size={22} color={colors.tint} />
              <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#FF3B30" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.1)',
    marginTop: 8,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});