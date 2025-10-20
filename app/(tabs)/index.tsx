// app/(tabs)/index.tsx
import { SidePanel } from '@/components/side-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Person {
  id: string;
  name: string;
  location: string;
  distance: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isSidePanelVisible, setIsSidePanelVisible] = useState(false);

  // Mock data - replace with your actual data
  const nearbyPeople: Person[] = [
    { id: '1', name: 'Someone1', location: 'location somewhere', distance: '0.5 mi' },
    { id: '2', name: 'Someone2', location: 'location somewhere', distance: '0.8 mi' },
    { id: '3', name: 'Someone3', location: 'location somewhere', distance: '1.2 mi' },
    { id: '4', name: 'Someone4', location: 'location somewhere', distance: '1.5 mi' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Hamburger Menu Button - Outside ScrollView to stay fixed */}
      <TouchableOpacity 
        style={[
          styles.menuButton,
          { backgroundColor: colors.background } // Use theme background
        ]}
        onPress={() => setIsSidePanelVisible(true)}
      >
        <IconSymbol name="line.3.horizontal" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Rest of your content remains the same */}
        <View style={styles.header}>
          <ThemedText style={styles.locationLabel}>123 Anywhere St, Any City</ThemedText>
          <ThemedText type="title" style={styles.headerTitle}>
            Where to?
          </ThemedText>
        </View>

        <View style={styles.mapCard}>
          <ThemedText type="subtitle">Map Placeholder</ThemedText>
          <ThemedText style={styles.mapSubtitle}>
            Interactive map will go here
          </ThemedText>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.tint} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for people or places..."
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Nearby People</ThemedText>
        </View>

        {nearbyPeople.map((person) => (
          <TouchableOpacity key={person.id} style={styles.personItem}>
            <View style={styles.personAvatar}>
              <ThemedText style={styles.avatarText}>
                {person.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.personInfo}>
              <ThemedText type="defaultSemiBold" style={styles.personName}>
                {person.name}
              </ThemedText>
              <ThemedText style={styles.personLocation}>
                {person.location}
              </ThemedText>
            </View>
            <ThemedText style={styles.distance}>
              {person.distance}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <SidePanel 
        visible={isSidePanelVisible} 
        onClose={() => setIsSidePanelVisible(false)} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Important for absolute positioning
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 80, // Add padding to account for fixed menu button
  },
  menuButton: {
    position: 'absolute',
    top: 50, // Reduced from 60
    left: 16, // Reduced from 20 to match padding
    zIndex: 1000,
    padding: 12, // Increased padding for better touch target
    borderRadius: 12,
    shadowColor: '#000647ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  locationLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  mapCard: {
    height: 200,
    borderRadius: 20,
    backgroundColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mapSubtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    marginBottom: 4,
  },
  personLocation: {
    fontSize: 14,
    opacity: 0.7,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  bottomSpacer: {
    height: 20,
  },
});