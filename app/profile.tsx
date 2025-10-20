// app/(tabs)/profile.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CarInfo {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  seats: number;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [cars, setCars] = useState<CarInfo[]>([
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: '2022',
      licensePlate: 'ABC123',
      color: 'Blue',
      seats: 5
    }
  ]);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState<Partial<CarInfo>>({});

  const handleAddCar = () => {
    if (newCar.make && newCar.model && newCar.year) {
      setCars(prev => [...prev, {
        id: Date.now().toString(),
        make: newCar.make!,
        model: newCar.model!,
        year: newCar.year!,
        licensePlate: newCar.licensePlate || '',
        color: newCar.color || '',
        seats: newCar.seats || 5
      }]);
      setNewCar({});
      setIsAddingCar(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>U</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="title">User Name</ThemedText>
            <ThemedText style={styles.profileEmail}>user@example.com</ThemedText>
          </View>
        </View>

        {/* My Cars Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">My Cars</ThemedText>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddingCar(true)}
            >
              <IconSymbol name="plus" size={16} color={colors.tint} />
              <ThemedText style={styles.addButtonText}>Add Car</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Add Car Form */}
          {isAddingCar && (
            <View style={[styles.addCarForm, { backgroundColor: colors.background }]}>
              <ThemedText type="defaultSemiBold" style={styles.formTitle}>Add New Car</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Make (e.g., Toyota)"
                placeholderTextColor={colors.secondaryText}
                value={newCar.make}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, make: text }))}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Model (e.g., Camry)"
                placeholderTextColor={colors.secondaryText}
                value={newCar.model}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, model: text }))}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Year"
                placeholderTextColor={colors.secondaryText}
                value={newCar.year}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, year: text }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="License Plate"
                placeholderTextColor={colors.secondaryText}
                value={newCar.licensePlate}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, licensePlate: text }))}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Color"
                placeholderTextColor={colors.secondaryText}
                value={newCar.color}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, color: text }))}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Number of Seats"
                placeholderTextColor={colors.secondaryText}
                value={newCar.seats?.toString()}
                onChangeText={(text) => setNewCar(prev => ({ ...prev, seats: parseInt(text) || 5 }))}
                keyboardType="numeric"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setIsAddingCar(false)}
                >
                  <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.tint }]}
                  onPress={handleAddCar}
                >
                  <ThemedText style={styles.saveButtonText}>Save Car</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cars List */}
          {cars.map((car) => (
            <View key={car.id} style={[styles.carCard, { backgroundColor: colors.background }]}>
              <IconSymbol name="car.fill" size={32} color={colors.tint} />
              <View style={styles.carInfo}>
                <ThemedText type="defaultSemiBold">
                  {car.year} {car.make} {car.model}
                </ThemedText>
                <ThemedText style={styles.carDetails}>
                  {car.color} • {car.licensePlate} • {car.seats} seats
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.editCarButton}>
                <IconSymbol name="pencil" size={16} color={colors.icon} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Settings</ThemedText>
          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="bell.fill" size={20} color={colors.tint} />
            <ThemedText style={styles.settingsText}>Notifications</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="lock.fill" size={20} color={colors.tint} />
            <ThemedText style={styles.settingsText}>Privacy</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="questionmark.circle.fill" size={20} color={colors.tint} />
            <ThemedText style={styles.settingsText}>Help & Support</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
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
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  addCarForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  carInfo: {
    flex: 1,
    marginLeft: 12,
  },
  carDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  editCarButton: {
    padding: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  settingsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});