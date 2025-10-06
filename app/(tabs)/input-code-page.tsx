// app/input-code.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function InputCodeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmitCode = () => {
    if (code.trim().length === 0) {
      Alert.alert('Error', 'Please enter a code');
      return;
    }
    
    //TODO: Handle code submission logic here
    Alert.alert('Success', `Code submitted: ${code}`);
    setCode('');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Input Code',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ThemedText style={styles.description}>
        Enter the code you received from a friend to connect with them.
      </ThemedText>

      <TextInput
        style={[styles.codeInput, { 
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: colors.background 
        }]}
        placeholder="Enter code here..."
        placeholderTextColor={colors.secondaryText}
        value={code}
        onChangeText={setCode}
        maxLength={20}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: colors.tint }]}
        onPress={handleSubmitCode}
      >
        <ThemedText style={styles.submitButtonText}>Submit Code</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 90,
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});