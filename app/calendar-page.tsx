import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface WorkSchedule {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15');

  const workSchedules: WorkSchedule[] = [
    {
      id: '1',
      date: '2024-01-15',
      day: 'Monday',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      location: 'Downtown Office'
    },
    {
      id: '2',
      date: '2024-01-16',
      day: 'Tuesday',
      startTime: '10:00 AM',
      endTime: '06:00 PM',
      location: 'Main Campus'
    },
    {
      id: '3',
      date: '2024-01-17',
      day: 'Wednesday',
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      location: 'Remote'
    },
  ];

  const upcomingTrips = [
    {
      id: '1',
      date: '2024-01-18',
      time: '08:30 AM',
      destination: 'Work',
      participants: 3
    },
    {
      id: '2',
      date: '2024-01-19',
      time: '05:00 PM',
      destination: 'Home',
      participants: 2
    }
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Add Stack.Screen for navigation header */}
      <Stack.Screen 
        options={{ 
          title: 'My Schedule',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ padding: 8, marginLeft: -8 }}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <ThemedText type="title">My Schedule</ThemedText>
        <TouchableOpacity style={styles.addButton}>
          <IconSymbol name="plus" size={20} color="white" />
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Work Schedule Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Schedule</ThemedText>
          {workSchedules.map((schedule) => (
            <View key={schedule.id} style={[styles.scheduleCard, { backgroundColor: colors.background }]}>
              <View style={styles.dateBadge}>
                <ThemedText style={styles.dateText}>{schedule.day}</ThemedText>
              </View>
              <View style={styles.scheduleInfo}>
                <ThemedText type="defaultSemiBold">{schedule.startTime} - {schedule.endTime}</ThemedText>
                <ThemedText style={styles.location}>{schedule.location}</ThemedText>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <IconSymbol name="pencil" size={16} color={colors.tint} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Upcoming Trips Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Upcoming Trips</ThemedText>
          {upcomingTrips.map((trip) => (
            <View key={trip.id} style={[styles.tripCard, { backgroundColor: colors.background }]}>
              <IconSymbol name="car.fill" size={24} color={colors.tint} />
              <View style={styles.tripInfo}>
                <ThemedText type="defaultSemiBold">{trip.destination}</ThemedText>
                <ThemedText style={styles.tripDetails}>
                  {trip.date} at {trip.time} • {trip.participants} people
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <ThemedText style={styles.viewButtonText}>View</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 16, // Reduced from 80 since we now have the navigation header
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 0, // Remove top padding since header handles spacing
  },
  section: {
    marginBottom: 32,
  },
  scheduleCard: {
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
  dateBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  dateText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  tripCard: {
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
  tripInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tripDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});