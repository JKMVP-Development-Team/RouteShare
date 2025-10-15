// app/friend-requests.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { UserProfile } from '@/constants/user';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { acceptFriendRequest, getUserByEmail, getUserByName, rejectFriendRequest, sendFriendRequest } from '@/services/friend';
import { onFriendRequestsChange } from '@/services/user';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface FriendRequest {
  id: string;
  name: string;
  username: string;
  mutualFriends: number;
  timeAgo: string;
  avatar?: string;
}

export default function FriendRequestsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for real-time friend request changes
  useEffect(() => {
    const unsubscribe = onFriendRequestsChange((requests: UserProfile[]) => {
      console.log('Friend requests updated:', requests);
      
      // Transform the UserProfile data to your UI format
      const formattedRequests: FriendRequest[] = requests.map((profile) => ({
        id: profile.uid,
        name: profile.displayName || 'Unknown User',
        username: `@${profile.displayName?.toLowerCase().replace(/\s+/g, '') || 'unknown'}`,
        mutualFriends: 0, // Calculate mutual friends later if needed
        timeAgo: 'Recently', // We can add a timestamp field to track this
        avatar: profile.photoURL,
      }));
      
      setFriendRequests(formattedRequests);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Auto-search with debounce when user types
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty, clear results
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
      return;
    }

    // Set new timeout to search after user stops typing (800ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 800);

    // Cleanup timeout on unmount or when searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      Alert.alert('Declined', 'Friend request declined');
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', error.message || 'Failed to decline friend request');
    }
  };

  const handleAcceptAll = async () => {
    try {
      await Promise.all(
        friendRequests.map(request => acceptFriendRequest(request.id))
      );
      Alert.alert('Success', 'All friend requests accepted!');
    } catch (error: any) {
      console.error('Error accepting all requests:', error);
      Alert.alert('Error', error.message || 'Failed to accept all requests');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError('Keep typing to search for friends');
      return;
    }

    setSearching(true);
    setShowSearchResults(true);
    setSearchError(null);

    try {
      let results: UserProfile[] = [];
      
      // Check if search query is an email (contains @)
      if (searchQuery.includes('@')) {
        const response = await getUserByEmail(searchQuery.trim()) as any;
        if (response?.users && Array.isArray(response.users)) {
          results = response.users as UserProfile[];
        }
      } else {
        // Search by name
        const response = await getUserByName(searchQuery.trim()) as any;
        if (response?.users && Array.isArray(response.users)) {
          results = response.users as UserProfile[];
        }
      }
      
      setSearchResults(results);
      setSearchError(results.length === 0 ? 'No users found' : null);
    } catch (error: any) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setSearchError(error.message || 'Something went wrong while searching');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string, userName: string) => {
    try {
      await sendFriendRequest(userId);
      Alert.alert('Success', `Friend request sent to ${userName}!`);
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(user => user.uid !== userId));
      setSearchError(null);
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchError(null);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: colors.background }]}>
      {/* User Avatar and Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {item.name.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.userDetails}>
          <ThemedText type="defaultSemiBold" style={styles.userName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.username}>
            {item.username}
          </ThemedText>
          {item.mutualFriends > 0 ? (
            <ThemedText style={styles.mutualFriends}>
              {item.mutualFriends} mutual friend{item.mutualFriends !== 1 ? 's' : ''}
            </ThemedText>
          ) : (
            <ThemedText style={styles.noMutualFriends}>
              No mutual friends
            </ThemedText>
          )}
          <ThemedText style={styles.timeAgo}>
            {item.timeAgo}
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.acceptButton, { backgroundColor: colors.tint }]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <IconSymbol name="checkmark" size={18} color="white" />
          <ThemedText style={styles.acceptButtonText}>Accept</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.declineButton, { borderColor: colors.border }]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <IconSymbol name="xmark" size={18} color={colors.text} />
          <ThemedText style={[styles.declineButtonText, { color: colors.text }]}>
            Decline
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: UserProfile }) => (
    <View style={[styles.searchResultCard, { backgroundColor: colors.background }]}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {(item.displayName || 'U').charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.userDetails}>
          <ThemedText type="defaultSemiBold" style={styles.userName}>
            {item.displayName || 'Unknown User'}
          </ThemedText>
          <ThemedText style={styles.username}>
            {item.email}
          </ThemedText>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.sendRequestButton, { backgroundColor: colors.tint }]}
        onPress={() => handleSendFriendRequest(item.uid, item.displayName || 'this user')}
      >
        <IconSymbol name="person.badge.plus" size={18} color="white" />
        <ThemedText style={styles.sendRequestButtonText}>Add Friend</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="person.2.slash" size={64} color={colors.icon} />
      <ThemedText type="subtitle" style={styles.emptyStateTitle}>
        No Pending Requests
      </ThemedText>
      <ThemedText style={styles.emptyStateText}>
        When someone sends you a friend request, it will appear here.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Friend Requests',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Search Bar */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Friend Requests
        </ThemedText>
        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.tint }]}
            onPress={handleSearch}
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="magnifyingglass" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Section */}
      {showSearchResults && (
        <View style={styles.searchResultsSection}>
          <ThemedText type="defaultSemiBold" style={styles.searchResultsTitle}>
            Search Results
          </ThemedText>
          {searching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText style={styles.searchingText}>Searching...</ThemedText>
            </View>
          ) : searchError ? (
            <View style={styles.noResultsContainer}>
              <IconSymbol name="exclamationmark.triangle" size={48} color={colors.icon} />
              <ThemedText style={styles.noResultsText}>
                {searchError}
              </ThemedText>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.uid}
              scrollEnabled={false}
              style={styles.searchResultsList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <IconSymbol name="person.crop.circle.badge.questionmark" size={48} color={colors.icon} />
              <ThemedText style={styles.noResultsText}>
                No users found matching "{searchQuery}"
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Pending Requests Section */}
      <View style={styles.pendingSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Pending Requests
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {friendRequests.length} pending request{friendRequests.length !== 1 ? 's' : ''}
        </ThemedText>
        {friendRequests.length > 0 && (
          <TouchableOpacity 
            style={[styles.acceptAllButton, { backgroundColor: colors.tint }]}
            onPress={handleAcceptAll}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            <ThemedText style={styles.acceptAllText}>Accept All</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Friend Requests List */}
      <FlatList
        data={friendRequests}
        renderItem={renderFriendRequest}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 90,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultsSection: {
    marginBottom: 24,
  },
  searchResultsTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  searchResultsList: {
    marginBottom: 12,
  },
  searchResultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  sendRequestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  searchingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    marginTop: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  pendingSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  acceptAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  noMutualFriends: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});