import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { signIn, signUp } from '@/services/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    console.log("📝 handleAuth called");
    console.log("📧 Email:", email);
    console.log("🔒 Password length:", password.length);
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        console.log("📝 Attempting sign up...");
        await signUp(email, password, displayName.trim());
        console.log("✅ Sign up successful");
        Alert.alert('Success', 'Account created successfully!');
      } else {
        console.log("🔐 Attempting sign in...");
        await signIn(email, password);
        console.log("✅ Sign in successful");
        Alert.alert('Success', 'Signed in successfully!');
      }
      
      // Navigate back to home after successful auth
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("❌ Auth error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // For quick testing with emulator
  const handleQuickTest = async () => {
    console.log("🧪 Quick test sign in...");
    setEmail('test@example.com');
    setPassword('password123');
    
    setLoading(true);
    try {
      // Try to sign in first, if fails then sign up
      try {
        console.log("🔐 Trying to sign in as test user...");
        await signIn('test@example.com', 'password123');
        console.log("✅ Test user sign in successful");
        Alert.alert('Success', 'Signed in as test user!');
      } catch (signInError: any) {
        console.log("⚠️ Sign in failed, attempting sign up...");
        console.log("Sign in error:", signInError.code);
        await signUp('test@example.com', 'password123');
        console.log("✅ Test user created and signed in");
        Alert.alert('Success', 'Created test user and signed in!');
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("❌ Quick test error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </ThemedText>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!loading}
              returnKeyType="next"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <ThemedText style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </ThemedText>
          </TouchableOpacity>

          {/* Quick test button for development */}
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.testButton]}
              onPress={handleQuickTest}
              disabled={loading}
            >
              <ThemedText style={styles.testButtonText}>
                🧪 Quick Test Sign In
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Show current auth state */}
          {auth.currentUser && (
            <View style={styles.authStatus}>
              <ThemedText style={styles.authStatusText}>
                ✓ Signed in as: {auth.currentUser.email}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
  },
  testButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  authStatus: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
  },
  authStatusText: {
    color: '#34C759',
    textAlign: 'center',
  },
});