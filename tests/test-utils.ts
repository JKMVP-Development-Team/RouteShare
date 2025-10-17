/**
 * Shared test utilities for integration tests
 * This file sets up Firebase emulators connection and common test helpers
 */

import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { doSignOut } from '../services/auth';

// Setup Firebase for testing
const firebaseConfig = {
  apiKey: 'demo-key-for-testing',
  authDomain: 'routeshare-b1b01.firebaseapp.com',
  projectId: 'routeshare-b1b01',
  storageBucket: 'routeshare-b1b01.appspot.com',
  messagingSenderId: '619122582619',
  appId: '1:619122582619:web:e87b1a98c02c6fc782cb7e'
};

// Initialize Firebase app only if it doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators
let emulatorsConnected = false;

export const connectToEmulators = () => {
  if (!emulatorsConnected) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8082);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      emulatorsConnected = true;
      console.log('🔧 Connected to Firebase emulators');
    } catch (error) {
      console.log('⚠️ Emulators might already be connected');
    }
  }
};

/**
 * Clean up authentication state between tests
 */
export const cleanupAuth = async () => {
  try {
    if (auth && auth.currentUser) {
      await doSignOut();
    }
  } catch (error) {
    console.warn('Failed to clean up auth:', error);
  }
};

/**
 * Clear all users from Firebase Auth emulator
 */
export const clearAuthEmulator = async () => {
  try {
    const response = await fetch('http://localhost:9099/emulator/v1/projects/routeshare-b1b01/accounts', {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('🧹 Cleared Auth emulator data');
    }
  } catch (error) {
    console.warn('Failed to clear Auth emulator:', error);
  }
};

/**
 * Generate a unique test email
 */
export const generateTestEmail = (prefix: string = 'test') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}@example.com`;
};

/**
 * Generate test user credentials
 */
export const generateTestUser = (prefix: string = 'test') => ({
  email: generateTestEmail(prefix),
  password: 'Test@1234',
  displayName: `${prefix} User ${Date.now()}-${Math.floor(Math.random() * 1000)}`
});

/**
 * Wait for a condition to be true with timeout
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};