// app/signup.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!signupData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (signupData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual registration API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always succeed
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Sign Up',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Create Account
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Join RideShare today
          </ThemedText>
        </View>

        {/* Signup Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Full Name *</ThemedText>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}>
              <IconSymbol name="person.fill" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.secondaryText}
                value={signupData.fullName}
                onChangeText={(text) => setSignupData(prev => ({ ...prev, fullName: text }))}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}>
              <IconSymbol name="envelope.fill" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.secondaryText}
                value={signupData.email}
                onChangeText={(text) => setSignupData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}>
              <IconSymbol name="phone.fill" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.secondaryText}
                value={signupData.phone}
                onChangeText={(text) => setSignupData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password *</ThemedText>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}>
              <IconSymbol name="lock.fill" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Create a password"
                placeholderTextColor={colors.secondaryText}
                value={signupData.password}
                onChangeText={(text) => setSignupData(prev => ({ ...prev, password: text }))}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol 
                  name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                  size={20} 
                  color={colors.icon} 
                />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.passwordHint}>
              Must be at least 6 characters long
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm Password *</ThemedText>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.background 
            }]}>
              <IconSymbol name="lock.fill" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.secondaryText}
                value={signupData.confirmPassword}
                onChangeText={(text) => setSignupData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <IconSymbol 
                  name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} 
                  size={20} 
                  color={colors.icon} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.signupButton, 
              { backgroundColor: colors.tint },
              isLoading && styles.disabledButton
            ]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ThemedText style={styles.signupButtonText}>Creating Account...</ThemedText>
            ) : (
              <>
                <IconSymbol name="person.badge.plus.fill" size={20} color="white" />
                <ThemedText style={styles.signupButtonText}>Create Account</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <ThemedText style={[styles.termsText, { color: colors.secondaryText }]}>
              By creating an account, you agree to our{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => Alert.alert('Terms', 'Terms and conditions will be shown here')}>
              <ThemedText style={[styles.termsLink, { color: colors.tint }]}>
                Terms of Service
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.termsText, { color: colors.secondaryText }]}>
              {' '}and{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => Alert.alert('Privacy', 'Privacy policy will be shown here')}>
              <ThemedText style={[styles.termsLink, { color: colors.tint }]}>
                Privacy Policy
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={[styles.loginText, { color: colors.secondaryText }]}>
              Already have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/login-page')}>
              <ThemedText style={[styles.loginLink, { color: colors.tint }]}>
                Sign In
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    marginLeft: 4,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  termsLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});