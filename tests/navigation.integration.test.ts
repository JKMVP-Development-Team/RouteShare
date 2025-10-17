/**
 * NavigationService Integration Tests  
 * Tests navigation functions against Firestore emulator
 * 
 * Prerequisites:
 * - Firebase emulators running (firebase emulators:start)
 * - Firestore emulator on port 8082
 * 
 * Run: npm run test:navigation:integration
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { signUp } from '../services/auth';
import { db } from '../services/firebase';
import { NavigationService } from '../services/navigation';
import { cleanupAuth, connectToEmulators, generateTestUser } from './test-utils';

describe('NavigationService Integration Tests', () => {
  let testUserId: string;
  let testRouteId: string;

  beforeAll(() => {
    connectToEmulators();
  });

  beforeEach(async () => {
    await cleanupAuth();
    
    // Create a test user for navigation tests
    const testUser = generateTestUser('nav');
    const userCredential = await signUp(
      testUser.email, 
      testUser.password, 
      testUser.displayName
    );
    testUserId = userCredential.user.uid;
    
    // Create a test route owned by the test user
    const routeRef = doc(collection(db, 'routes'));
    testRouteId = routeRef.id;
    
    await setDoc(routeRef, {
      userId: testUserId, // This is crucial for security rules
      name: 'Test Route',
      description: 'A test route for navigation testing',
      waypoints: [
        { latitude: 37.7749, longitude: -122.4194, name: 'Start' },
        { latitude: 37.7849, longitude: -122.4094, name: 'End' }
      ],
      distance: 1000,
      estimatedTime: 600,
      createdAt: new Date(),
      navigationData: {
        currentStatus: 'inactive',
        activeNavigators: [],
        lastUpdated: new Date()
      }
    });
  });

  afterEach(async () => {
    await cleanupAuth();
  });

  describe('Navigation Session Management', () => {
    it('should start navigation session', async () => {
      // Should not throw an error
      await expect(
        NavigationService.startNavigation(testRouteId, testUserId)
      ).resolves.toBeUndefined();
    }, 10000);

    it('should end navigation session', async () => {
      // Start navigation first
      await NavigationService.startNavigation(testRouteId, testUserId);
      
      // End navigation - should not throw
      await expect(
        NavigationService.endNavigation(testRouteId, testUserId)
      ).resolves.toBeUndefined();
    }, 10000);
  });

  describe('Navigation Progress Tracking', () => {
    it('should update navigation progress', async () => {
      const navigationUpdate = {
        routeId: testRouteId,
        userId: testUserId,
        currentLocation: { latitude: 37.7749, longitude: -122.4194 },
        remainingDistance: 1500,
        remainingTime: 300,
        speed: 30,
        timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };
      
      // Should not throw an error
      await expect(
        NavigationService.updateNavigationProgress(navigationUpdate)
      ).resolves.toBeUndefined();
    }, 10000);
  });

  describe('Route Management', () => {
    it('should return null for non-existent route', async () => {
      const nonExistentRouteId = `non-existent-${Date.now()}`;
      
      const route = await NavigationService.getRoute(nonExistentRouteId);
      expect(route).toBeNull();
    }, 10000);

    it('should handle route retrieval errors gracefully', async () => {
      const invalidRouteId = '';
      
      const route = await NavigationService.getRoute(invalidRouteId);
      expect(route).toBeNull();
    }, 10000);
  });

  describe('Active Navigators', () => {
    it('should return empty array for route with no active navigators', async () => {
      const routeId = `test-route-${Date.now()}`;
      
      const activeNavigators = await NavigationService.getActiveNavigators(routeId);
      expect(Array.isArray(activeNavigators)).toBe(true);
      expect(activeNavigators).toHaveLength(0);
    }, 10000);
  });

  describe('Real-time Navigation Updates', () => {
    it('should set up navigation updates subscription', async () => {
      const routeId = `test-route-${Date.now()}`;
      let callbackInvoked = false;
      
      const unsubscribe = NavigationService.subscribeToNavigationUpdates(
        routeId,
        (updates) => {
          callbackInvoked = true;
          expect(Array.isArray(updates)).toBe(true);
        }
      );
      
      // Wait a bit for subscription to set up
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clean up subscription
      unsubscribe();
      
      // Subscription should have been created (callback might not be invoked without data)
      expect(typeof unsubscribe).toBe('function');
    }, 10000);
  });
});