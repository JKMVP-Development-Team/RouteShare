// app/create-trip.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateTripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [tripData, setTripData] = useState({
    destination: '',
    date: '',
    time: '',
    maxParticipants: '',
    notes: ''
  });

  const handleCreateTrip = () => {
    if (!tripData.destination || !tripData.date || !tripData.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // TODO: Save trip data to your backend
    Alert.alert('Success', 'Trip created successfully!');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Trip',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Destination *</ThemedText>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Where are you going?"
              placeholderTextColor={colors.secondaryText}
              value={tripData.destination}
              onChangeText={(text) => setTripData(prev => ({ ...prev, destination: text }))}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText style={styles.label}>Date *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.secondaryText}
                value={tripData.date}
                onChangeText={(text) => setTripData(prev => ({ ...prev, date: text }))}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText style={styles.label}>Time *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="HH:MM AM/PM"
                placeholderTextColor={colors.secondaryText}
                value={tripData.time}
                onChangeText={(text) => setTripData(prev => ({ ...prev, time: text }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Max Participants</ThemedText>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Number of people"
              placeholderTextColor={colors.secondaryText}
              value={tripData.maxParticipants}
              onChangeText={(text) => setTripData(prev => ({ ...prev, maxParticipants: text }))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Notes</ThemedText>
            <TextInput
              style={[styles.textArea, { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Any additional notes..."
              placeholderTextColor={colors.secondaryText}
              value={tripData.notes}
              onChangeText={(text) => setTripData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: colors.tint }]}
            onPress={handleCreateTrip}
          >
            <IconSymbol name="car.fill" size={20} color="white" />
            <ThemedText style={styles.createButtonText}>Create Trip</ThemedText>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});