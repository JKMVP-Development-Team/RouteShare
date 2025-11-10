import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { NavigationService, NavigationUpdate } from '../services/navigation';

// Mock the firebase imports
jest.mock('../services/firebase', () => ({
  db: 'mocked-db'
}));

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startNavigation', () => {
    it('should start navigation session successfully', async () => {
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
      const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
      const mockCollection = collection as jest.MockedFunction<typeof collection>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;
      const mockArrayUnion = arrayUnion as jest.MockedFunction<typeof arrayUnion>;
      const mockTimestamp = Timestamp.now as jest.MockedFunction<typeof Timestamp.now>;

      mockDoc.mockReturnValue('mock-route-ref' as any);
      mockCollection.mockReturnValue('mock-collection-ref' as any);
      mockArrayUnion.mockReturnValue('mock-array-union' as any);
      mockTimestamp.mockReturnValue({ seconds: 1635724800, nanoseconds: 0 } as any);

      await NavigationService.startNavigation('route-123', 'user-456');

      expect(mockDoc).toHaveBeenCalledWith(db, 'routes', 'route-123');
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-route-ref', {
        'navigationData.currentStatus': 'active',
        'navigationData.activeNavigators': 'mock-array-union',
        'navigationData.lastUpdated': { seconds: 1635724800, nanoseconds: 0 }
      });

      expect(mockCollection).toHaveBeenCalledWith(db, 'navigationSessions');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection-ref', {
        routeId: 'route-123',
        userId: 'user-456',
        startedAt: { seconds: 1635724800, nanoseconds: 0 },
        status: 'active'
      });
    });
  });

  describe('updateNavigationProgress', () => {
    it('should update navigation progress', async () => {
      const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
      const mockCollection = collection as jest.MockedFunction<typeof collection>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;
      const mockTimestamp = Timestamp.now as jest.MockedFunction<typeof Timestamp.now>;

      mockCollection.mockReturnValue('mock-updates-ref' as any);
      mockDoc.mockReturnValue('mock-route-ref' as any);
      mockTimestamp.mockReturnValue({ seconds: 1635724800, nanoseconds: 0 } as any);

      const update: NavigationUpdate = {
        routeId: 'route-123',
        userId: 'user-456',
        currentLocation: { latitude: 37.7749, longitude: -122.4194 },
        remainingDistance: 1500,
        remainingTime: 300,
        speed: 30,
        timestamp: { seconds: 1635724800, nanoseconds: 0 } as any
      };

      await NavigationService.updateNavigationProgress(update);

      expect(mockAddDoc).toHaveBeenCalledWith('mock-updates-ref', {
        ...update,
        timestamp: { seconds: 1635724800, nanoseconds: 0 }
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-route-ref', {
        'navigationData.lastUpdated': { seconds: 1635724800, nanoseconds: 0 }
      });
    });
  });

  describe('endNavigation', () => {
    it('should end navigation session', async () => {
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      const mockQuery = query as jest.MockedFunction<typeof query>;
      const mockWhere = where as jest.MockedFunction<typeof where>;
      const mockCollection = collection as jest.MockedFunction<typeof collection>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;
      const mockArrayRemove = arrayRemove as jest.MockedFunction<typeof arrayRemove>;
      const mockTimestamp = Timestamp.now as jest.MockedFunction<typeof Timestamp.now>;

      mockDoc.mockReturnValue('mock-route-ref' as any);
      mockCollection.mockReturnValue('mock-sessions-ref' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockArrayRemove.mockReturnValue('mock-array-remove' as any);
      mockTimestamp.mockReturnValue({ seconds: 1635724800, nanoseconds: 0 } as any);

      const mockSessionDoc = {
        ref: 'mock-session-ref'
      };
      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback(mockSessionDoc);
        }
      } as any);

      await NavigationService.endNavigation('route-123', 'user-456');

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-route-ref', {
        'navigationData.activeNavigators': 'mock-array-remove',
        'navigationData.lastUpdated': { seconds: 1635724800, nanoseconds: 0 }
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-session-ref', {
        status: 'completed',
        completedAt: { seconds: 1635724800, nanoseconds: 0 }
      });
    });
  });

  describe('getRoute', () => {
    it('should return route when it exists', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;

      mockDoc.mockReturnValue('mock-route-ref' as any);
      
      const mockRouteData = {
        name: 'Test Route',
        creatorId: 'user-123',
        waypoints: []
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'route-123',
        data: () => mockRouteData
      } as any);

      const result = await NavigationService.getRoute('route-123');

      expect(result).toEqual({
        id: 'route-123',
        ...mockRouteData
      });
    });

    it('should return null when route does not exist', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;

      mockDoc.mockReturnValue('mock-route-ref' as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as any);

      const result = await NavigationService.getRoute('route-123');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      const mockDoc = doc as jest.MockedFunction<typeof doc>;

      mockDoc.mockReturnValue('mock-route-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await NavigationService.getRoute('route-123');

      expect(result).toBeNull();
    });
  });
});