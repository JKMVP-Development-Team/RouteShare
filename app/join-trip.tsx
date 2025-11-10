// app/join-trip.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function JoinTripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [tripCode, setTripCode] = useState('');

  const availableTrips = [
    {
      id: '1',
      code: 'TRIP123',
      destination: 'Work Commute',
      date: 'Today, 08:30 AM',
      driver: 'Sarah M.',
      seats: 2
    },
    {
      id: '2',
      code: 'TRIP456',
      destination: 'Airport Run',
      date: 'Tomorrow, 02:00 PM',
      driver: 'Mike T.',
      seats: 3
    }
  ];

  const handleJoinByCode = () => {
    if (!tripCode.trim()) {
      Alert.alert('Error', 'Please enter a trip code');
      return;
    }

    // TODO: Validate trip code and join trip
    Alert.alert('Success', `Joined trip with code: ${tripCode}`);
    setTripCode('');
  };

  const handleJoinTrip = (tripId: string) => {
    Alert.alert('Success', 'You have joined the trip!');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Join a Trip',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView}>
        {/* Join by Code Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Join with Code</ThemedText>
          <View style={styles.codeContainer}>
            <TextInput
              style={[styles.codeInput, { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Enter trip code"
              placeholderTextColor={colors.secondaryText}
              value={tripCode}
              onChangeText={setTripCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={[styles.joinButton, { backgroundColor: colors.tint }]}
              onPress={handleJoinByCode}
            >
              <ThemedText style={styles.joinButtonText}>Join</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Trips Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Available Trips</ThemedText>
          
          {availableTrips.map((trip) => (
            <View key={trip.id} style={[styles.tripCard, { backgroundColor: colors.background }]}>
              <View style={styles.tripHeader}>
                <ThemedText type="defaultSemiBold" style={styles.tripCode}>{trip.code}</ThemedText>
                <View style={styles.seatsBadge}>
                  <IconSymbol name="person.fill" size={12} color="white" />
                  <ThemedText style={styles.seatsText}>{trip.seats}</ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.tripDestination}>{trip.destination}</ThemedText>
              
              <View style={styles.tripDetails}>
                <View style={styles.detailItem}>
                  <IconSymbol name="calendar" size={14} color={colors.icon} />
                  <ThemedText style={styles.detailText}>{trip.date}</ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <IconSymbol name="person.fill" size={14} color={colors.icon} />
                  <ThemedText style={styles.detailText}>{trip.driver}</ThemedText>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.joinTripButton, { backgroundColor: colors.tint }]}
                onPress={() => handleJoinTrip(trip.id)}
              >
                <IconSymbol name="person.badge.plus" size={16} color="white" />
                <ThemedText style={styles.joinTripButtonText}>Join Trip</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* QR Code Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Scan QR Code</ThemedText>
          <TouchableOpacity style={[styles.qrButton, { backgroundColor: colors.background }]}>
            <IconSymbol name="qrcode.viewfinder" size={32} color={colors.tint} />
            <ThemedText style={styles.qrButtonText}>Scan QR Code to Join</ThemedText>
            <ThemedText style={styles.qrSubtext}>Tap to open camera</ThemedText>
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
  codeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tripCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripCode: {
    fontSize: 16,
    color: '#007AFF',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  seatsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tripDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.7,
  },
  joinTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  joinTripButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  qrButton: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  qrSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});