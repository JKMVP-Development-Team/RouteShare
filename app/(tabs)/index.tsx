// app/(tabs)/index.tsx
import { SidePanel } from '@/components/side-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

  const renderPersonItem = ({ item }: { item: Person }) => (
    <TouchableOpacity style={styles.personItem}>
      <View style={styles.personAvatar}>
        <ThemedText style={styles.avatarText}>
          {item.name.charAt(0)}
        </ThemedText>
      </View>
      <View style={styles.personInfo}>
        <ThemedText type="defaultSemiBold" style={styles.personName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.personLocation}>
          {item.location}
        </ThemedText>
      </View>
      <ThemedText style={styles.distance}>
        {item.distance}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Hamburger Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setIsSidePanelVisible(true)}
      >
        <IconSymbol name="line.3.horizontal" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Header with Location - Moved Lower */}
      <View style={styles.header}>
        <ThemedText style={styles.locationLabel}>123 Anywhere St, Any City</ThemedText>
        <ThemedText type="title" style={styles.headerTitle}>
          Where to?
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.tint} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for people or places..."
          placeholderTextColor={colors.secondaryText}
        />
      </View>

      {/* Nearby People List */}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Nearby People</ThemedText>
      </View>

      <FlatList
        data={nearbyPeople}
        renderItem={renderPersonItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Side Panel */}
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
    padding: 16,
  },
  menuButton: {
    position: 'absolute',
    top: 60, // Adjust this value to position the hamburger button
    left: 20,
    zIndex: 1000,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  header: {
    marginTop: 100, // Increased from 16 to push header lower
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
  list: {
    flex: 1,
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
});