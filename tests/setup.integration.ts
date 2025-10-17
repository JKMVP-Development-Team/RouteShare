/**
 * Setup file for integration tests
 * This file does NOT mock Firebase since integration tests need real Firebase emulators
 */

// Mock only React Native modules (not Firebase)
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock Expo Location (not needed for integration tests but won't hurt)
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

// Set up environment variables for tests
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'demo-key-for-testing';
process.env.__DEV__ = 'false';

// Console logging for debugging (optional)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};