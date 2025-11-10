// app/(tabs)/trips.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const upcomingTrips = [
    {
      id: '1',
      date: 'Jan 18, 2024',
      time: '08:30 AM',
      from: 'Home',
      to: 'Work',
      participants: 3,
      status: 'confirmed'
    },
    {
      id: '2',
      date: 'Jan 19, 2024',
      time: '05:00 PM',
      from: 'Work',
      to: 'Home',
      participants: 2,
      status: 'pending'
    }
  ];

  const pastTrips = [
    {
      id: '3',
      date: 'Jan 15, 2024',
      from: 'Home',
      to: 'Airport',
      participants: 4,
      role: 'Driver'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Trips</ThemedText>
        
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.background }]}
            onPress={() => router.push({ pathname: '/create-trip-page' })}
          >
            <IconSymbol name="car.fill" size={24} color={colors.tint} />
            <ThemedText style={styles.quickActionText}>Create Trip</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.background }]}
            onPress={() => router.push({ pathname: '/join-trip' } as any)}
          >
            <IconSymbol name="qrcode" size={24} color={colors.tint} />
            <ThemedText style={styles.quickActionText}>Join Trip</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Upcoming Trips */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Upcoming Trips</ThemedText>
          {upcomingTrips.map((trip) => (
            <TouchableOpacity 
              key={trip.id}
              style={[styles.tripCard, { backgroundColor: colors.background }]}
              onPress={() => router.push({ pathname: `/trip-details/${trip.id}` } as any)}
            >
              <View style={styles.tripHeader}>
                <ThemedText type="defaultSemiBold">{trip.date} at {trip.time}</ThemedText>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: trip.status === 'confirmed' ? '#34C759' : '#FF9500' }
                ]}>
                  <ThemedText style={styles.statusText}>
                    {trip.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.route}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
                <View style={styles.routeDot} />
              </View>
              <View style={styles.locations}>
                <ThemedText style={styles.location}>{trip.from}</ThemedText>
                <ThemedText style={styles.location}>{trip.to}</ThemedText>
              </View>
              <View style={styles.tripFooter}>
                <View style={styles.participants}>
                  <IconSymbol name="person.2.fill" size={16} color={colors.icon} />
                  <ThemedText style={styles.participantsText}>
                    {trip.participants} people
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.icon} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Past Trips */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Past Trips</ThemedText>
          {pastTrips.map((trip) => (
            <TouchableOpacity 
              key={trip.id}
              style={[styles.tripCard, { backgroundColor: colors.background }]}
            >
              <ThemedText type="defaultSemiBold">{trip.date}</ThemedText>
              <View style={styles.route}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
                <View style={styles.routeDot} />
              </View>
              <View style={styles.locations}>
                <ThemedText style={styles.location}>{trip.from}</ThemedText>
                <ThemedText style={styles.location}>{trip.to}</ThemedText>
              </View>
              <View style={styles.tripFooter}>
                <ThemedText style={styles.roleText}>You were the {trip.role}</ThemedText>
                <ThemedText style={styles.participantsText}>
                  {trip.participants} people
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 80,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionText: {
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
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
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#007AFF',
    marginHorizontal: 8,
  },
  locations: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});