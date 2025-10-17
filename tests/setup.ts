// Test setup file
import { jest } from '@jest/globals';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithPopup: jest.fn(),
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1635724800, nanoseconds: 0 })),
  },
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
  getFunctions: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

// Set up environment variables for tests
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'test-api-key';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};