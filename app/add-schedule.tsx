// app/add-schedule.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddScheduleScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [scheduleData, setScheduleData] = useState({
    day: '',
    startTime: '',
    endTime: '',
    location: '',
    recurring: false
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleSaveSchedule = () => {
    if (!scheduleData.day || !scheduleData.startTime || !scheduleData.endTime || !scheduleData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // TODO: Save schedule to your backend
    Alert.alert('Success', 'Schedule added successfully!');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Add Schedule',
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
            <ThemedText style={styles.label}>Day of Week *</ThemedText>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    { 
                      backgroundColor: scheduleData.day === day ? colors.tint : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setScheduleData(prev => ({ ...prev, day }))}
                >
                  <ThemedText style={[
                    styles.dayText,
                    { color: scheduleData.day === day ? 'white' : colors.text }
                  ]}>
                    {day.substring(0, 3)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText style={styles.label}>Start Time *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="09:00 AM"
                placeholderTextColor={colors.secondaryText}
                value={scheduleData.startTime}
                onChangeText={(text) => setScheduleData(prev => ({ ...prev, startTime: text }))}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText style={styles.label}>End Time *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background 
                }]}
                placeholder="05:00 PM"
                placeholderTextColor={colors.secondaryText}
                value={scheduleData.endTime}
                onChangeText={(text) => setScheduleData(prev => ({ ...prev, endTime: text }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location *</ThemedText>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Work location"
              placeholderTextColor={colors.secondaryText}
              value={scheduleData.location}
              onChangeText={(text) => setScheduleData(prev => ({ ...prev, location: text }))}
            />
          </View>

          <TouchableOpacity 
            style={[styles.recurringButton, { 
              backgroundColor: scheduleData.recurring ? colors.tint : 'transparent',
              borderColor: colors.border
            }]}
            onPress={() => setScheduleData(prev => ({ ...prev, recurring: !prev.recurring }))}
          >
            <IconSymbol 
              name={scheduleData.recurring ? "checkmark.square.fill" : "square"} 
              size={20} 
              color={scheduleData.recurring ? 'white' : colors.text} 
            />
            <ThemedText style={[
              styles.recurringText,
              { color: scheduleData.recurring ? 'white' : colors.text }
            ]}>
              Recurring weekly
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSaveSchedule}
          >
            <IconSymbol name="calendar.badge.plus" size={20} color="white" />
            <ThemedText style={styles.saveButtonText}>Save Schedule</ThemedText>
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
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  recurringText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});