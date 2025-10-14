import { SidePanel } from '@/components/side-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/services/firebase';
import { createParty } from '@/services/party';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Person {
  id: string;
  name: string;
  location: string;
  distance: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const [isSidePanelVisible, setIsSidePanelVisible] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [showPartyCreated, setShowPartyCreated] = useState(false);

  const [user, setUser] = useState(auth.currentUser);
  
  // Party creation state
  const [partyName, setPartyName] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [creating, setCreating] = useState(false);

  // Created party info
  const [createdPartyCode, setCreatedPartyCode] = useState('');
  const [createdPartyQR, setCreatedPartyQR] = useState('');


  const nearbyPeople: Person[] = [
    { id: '1', name: 'Someone1', location: 'location somewhere', distance: '0.5 mi' },
    { id: '2', name: 'Someone2', location: 'location somewhere', distance: '0.8 mi' },
    { id: '3', name: 'Someone3', location: 'location somewhere', distance: '1.2 mi' },
    { id: '4', name: 'Someone4', location: 'location somewhere', distance: '1.5 mi' },
  ];

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        // Redirect to sign in if not authenticated
        router.replace('/(tabs)/signin');
      }
    });

    return unsubscribe;
  }, []);


  const handleCreateParty = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be signed in to create a party');
      return;
    }

    if (!partyName.trim()) {
      Alert.alert('Error', 'Please enter a party name');
      return;
    }
    setCreating(true);

    try {
      console.log('Creating party:', { name: partyName, maxMembers });
      
      const result = await createParty({
        name: partyName,
        maxMembers: parseInt(maxMembers) || 10,
      });

      console.log('Party created:', result);

      // Store the party code and QR code (always present for all parties)
      setCreatedPartyCode(result.inviteCode);
      setCreatedPartyQR(result.qrCode);
      
      // Close create modal and show success modal
      setShowCreateParty(false);
      setShowPartyCreated(true);
      
      // Reset form
      setPartyName('');
      setMaxMembers('10');
    } catch (error: any) {
      console.error('Create party error:', error);
      Alert.alert('Error', error.message || 'Failed to create party');
    } finally {
      setCreating(false);
    }
  };

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

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authPrompt}>
          <ThemedText type="title" style={styles.authTitle}>Welcome to RouteShare</ThemedText>
          <ThemedText style={styles.authSubtitle}>Please sign in to continue</ThemedText>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(tabs)/signin')}
          >
            <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setIsSidePanelVisible(true)}
      >
        <IconSymbol name="line.3.horizontal" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => setShowCreateParty(true)}
      >
        <ThemedText style={styles.testButtonText}>+ Create Party</ThemedText>
      </TouchableOpacity>

      <View style={styles.header}>
        <ThemedText style={styles.locationLabel}>123 Anywhere St, Any City</ThemedText>
        <ThemedText type="title" style={styles.headerTitle}>
          Where to?
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

      <FlatList
        data={nearbyPeople}
        renderItem={renderPersonItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Party Modal */}
      <Modal
        visible={showCreateParty}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateParty(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>Create Party</ThemedText>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Party Name"
              placeholderTextColor={colors.secondaryText}
              value={partyName}
              onChangeText={setPartyName}
              editable={!creating}
            />
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Max Members (default: 10)"
              placeholderTextColor={colors.secondaryText}
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="numeric"
              editable={!creating}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCreateParty(false)}
                disabled={creating}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.createButton, creating && styles.buttonDisabled]}
                onPress={handleCreateParty}
                disabled={creating}
              >
                <ThemedText style={styles.createButtonText}>
                  {creating ? 'Creating...' : 'Create'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Party Created Success Modal */}
      <Modal
        visible={showPartyCreated}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPartyCreated(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>🎉 Party Created!</ThemedText>
            
            <ThemedText style={styles.successText}>
              Share this code with your friends:
            </ThemedText>
            
            <View style={styles.codeContainer}>
              <ThemedText type="title" style={styles.inviteCode}>
                {createdPartyCode}
              </ThemedText>
            </View>

            {createdPartyQR && (
              <View style={styles.qrContainer}>
                <ThemedText style={styles.qrLabel}>Or scan this QR code:</ThemedText>
                <Image 
                  source={{ uri: createdPartyQR }} 
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.createButton, { marginTop: 20 }]}
              onPress={() => setShowPartyCreated(false)}
            >
              <ThemedText style={styles.createButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  authSubtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1000,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  testButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    marginTop: 100,
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
    shadowOffset: { width: 0, height: 2 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  switchButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  codeContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  inviteCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrLabel: {
    marginBottom: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});