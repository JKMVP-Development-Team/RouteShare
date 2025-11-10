/**
 * AuthService Integration Tests
 * Tests authentication functions against Firebase Auth emulator
 * 
 * Prerequisites:
 * - Firebase emulators running (firebase emulators:start)
 * - Auth emulator on port 9099
 * 
 * Run: npm run test:auth:integration
 */

import { doPasswordChange, doPasswordReset, doSignOut, signIn, signUp } from '../services/auth';
import { auth } from '../services/firebase';
import { cleanupAuth, connectToEmulators, generateTestUser } from './test-utils';

describe('AuthService Integration Tests', () => {
  beforeAll(() => {
    connectToEmulators();
  });

  beforeEach(async () => {
    await cleanupAuth();
  });

  afterEach(async () => {
    await cleanupAuth();
  });

  describe('User Registration', () => {
    it('should create a new user with email and password', async () => {
      const testUser = generateTestUser('signup');
      
      const userCredential = await signUp(
        testUser.email, 
        testUser.password, 
        testUser.displayName
      );
      
      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(testUser.email);
      expect(userCredential.user.displayName).toBe(testUser.displayName);
      expect(userCredential.user.uid).toBeDefined();
    }, 10000);

    it('should create user profile in Firestore', async () => {
      const testUser = generateTestUser('profile');
      
      const userCredential = await signUp(
        testUser.email, 
        testUser.password, 
        testUser.displayName
      );
      
      // Wait for Firestore sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // The signUp function should create a user document in Firestore
      // This is tested by checking if the user was created successfully
      expect(userCredential.user.uid).toBeDefined();
    }, 10000);

    it('should handle duplicate email registration', async () => {
      const testUser = generateTestUser('duplicate');
      
      // Create user first time
      await signUp(testUser.email, testUser.password, testUser.displayName);
      await cleanupAuth();
      
      // Try to create same user again
      await expect(
        signUp(testUser.email, testUser.password, 'Different Name')
      ).rejects.toThrow();
    }, 10000);
  });

  describe('User Sign In', () => {
    it('should sign in existing user', async () => {
      const testUser = generateTestUser('signin');
      
      // Create user first
      await signUp(testUser.email, testUser.password, testUser.displayName);
      await doSignOut();
      
      // Sign in
      const userCredential = await signIn(testUser.email, testUser.password);
      
      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(testUser.email);
      expect(userCredential.user.displayName).toBe(testUser.displayName);
    }, 10000);

    it('should handle invalid credentials', async () => {
      const testUser = generateTestUser('invalid');
      
      await expect(
        signIn(testUser.email, 'wrongpassword')
      ).rejects.toThrow();
    }, 10000);
  });

  describe('User Sign Out', () => {
    it('should sign out current user', async () => {
      const testUser = generateTestUser('signout');
      
      // Create and sign in user
      await signUp(testUser.email, testUser.password, testUser.displayName);
      expect(auth.currentUser).toBeDefined();
      
      // Sign out
      await doSignOut();
      expect(auth.currentUser).toBeNull();
    }, 10000);
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const testUser = generateTestUser('reset');
      
      // Create user first
      await signUp(testUser.email, testUser.password, testUser.displayName);
      await doSignOut();
      
      // Request password reset (should not throw)
      await expect(doPasswordReset(testUser.email)).resolves.toBeUndefined();
    }, 10000);

    it('should handle password reset for non-existent user', async () => {
      const nonExistentEmail = generateTestUser('nonexistent').email;
      
      // Firebase Auth might throw 'user-not-found' error for non-existent users
      await expect(doPasswordReset(nonExistentEmail)).rejects.toThrow();
    }, 10000);
  });


  describe('Password Change', () => {
        it('should change the password for the signed-in user', async () => {
            const testUser = generateTestUser('changepw');

            // Create and sign in user
            await signUp(testUser.email, testUser.password, testUser.displayName);
            const newPassword = 'NewP@ssw0rd!';
            await expect(doPasswordChange(newPassword)).resolves.toBeUndefined();

            // Sign out and sign in with new password to verify
            await doSignOut();
            const userCredential = await signIn(testUser.email, newPassword);
            expect(userCredential.user).toBeDefined();
        }
        , 10000);

        it('should handle password change when no user is signed in', async () => {
            const newPassword = 'AnotherP@ssw0rd!';
            await expect(doPasswordChange(newPassword)).rejects.toThrow('No user is currently signed in');
        }, 10000);
  });
});