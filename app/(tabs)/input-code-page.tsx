import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/services/firebase';
import { joinParty } from '@/services/party';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function InputCodePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinByCode = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be signed in to join a party');
      return;
    }

    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Error', 'Invite code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      // First, find the party with this invite code
      const partiesRef = collection(db, 'parties');
      const q = query(partiesRef, where('inviteCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Invalid invite code. Please check and try again.');
        return;
      }

      const partyDoc = querySnapshot.docs[0];
      const partyId = partyDoc.id;

      // Now join the party
      await joinParty({
        partyId: partyId,
        inviteCode: code,
      });

      Alert.alert('Success!', 'You have joined the party!', [
        { 
          text: 'OK', 
          onPress: () => {
            setInviteCode('');
            router.back();
          }
        },
      ]);
    } catch (error: any) {
      console.error('Join party error:', error);
      Alert.alert('Error', error.message || 'Failed to join party');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Join Party</ThemedText>
      
      <ThemedText style={styles.description}>
        Enter the 6-character invite code shared by the party host
      </ThemedText>
      
      <TextInput
        placeholder="ABC123"
        value={inviteCode}
        onChangeText={(text) => setInviteCode(text.toUpperCase())}
        style={styles.input}
        autoCapitalize="characters"
        maxLength={6}
        editable={!loading}
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoinByCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>Join Party</ThemedText>
        )}
      </TouchableOpacity>

      <ThemedText style={styles.orText}>or</ThemedText>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          // TODO: Implement QR code scanning
          Alert.alert('Coming Soon', 'QR code scanning will be available soon!');
        }}
        disabled={loading}
      >
        <ThemedText style={styles.scanButtonText}>Scan QR Code</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.5,
  },
  scanButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});