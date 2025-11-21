jest.mock('firebase/database');
jest.mock('firebase/firestore');

import { get, push, ref, serverTimestamp, set, update } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { NavigationService, NavigationUpdate } from '../services/navigation';

// Mock the firebase imports
jest.mock('../services/firebase', () => ({
  rtdb: 'mocked-rtdb'
}));

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startNavigation', () => {
    it('should start navigation session successfully', async () => {
      const mockRef = jest.mocked(ref);
      const mockUpdate = jest.mocked(update);
      const mockSet = jest.mocked(set);
      const mockPush = jest.mocked(push);
      const mockServerTimestamp = jest.mocked(serverTimestamp);

      const mockRouteRef = 'mock-route-ref' as any;
      const mockSessionRef = 'mock-session-ref' as any;
      const mockNewSessionRef = 'mock-new-session-ref' as any;

      mockRef.mockReturnValueOnce(mockRouteRef).mockReturnValueOnce(mockSessionRef);
      mockServerTimestamp.mockReturnValue(serverTimestamp);
      mockPush.mockReturnValue(mockNewSessionRef)
      mockUpdate.mockResolvedValue(undefined as any);
      mockSet.mockResolvedValue(undefined as any);

      await NavigationService.startNavigation('route123', 'user456');

      expect(mockRef).toHaveBeenCalledWith(rtdb, 'routes/route123');
      expect(mockUpdate).toHaveBeenCalledWith(mockRouteRef, {
        'navigationData/currentStatus': 'active',
        'navigationData/activeNavigators/user456': true,
        'navigationData/lastUpdated': mockServerTimestamp
      });

      expect(mockRef).toHaveBeenCalledWith(rtdb, 'navigationSessions');
      expect(mockPush).toHaveBeenCalledWith(mockSessionRef);
      expect(mockSet).toHaveBeenCalledWith(mockNewSessionRef, {
        routeId: 'route123',
        userId: 'user456',
        startedAt: mockServerTimestamp,
        status: 'active'
      });
    });

  describe('updateNavigationProgress', () => {
    it('should update navigation progress', async () => {
      const mockRef = jest.mocked(ref);
      const mockUpdate = jest.mocked(update);
      const mockGet = jest.mocked(get);
      const mockServerTimestamp = jest.mocked(serverTimestamp);

      mockGet.mockReturnValue('mock-updates-ref' as any);
      mockRef.mockReturnValue('mock-route-ref' as any);
      mockServerTimestamp.mockReturnValue(serverTimestamp);

      const navUpdate: NavigationUpdate = {
        routeId: 'route123',
        userId: 'user456',
        currentLocation: { latitude: 37.7749, longitude: -122.4194 },
        remainingDistance: 1500,
        remainingTime: 300,
        speed: 30,
        timestamp: mockServerTimestamp as any
      };

      await NavigationService.updateNavigationProgress(navUpdate);

      expect(mockUpdate).toHaveBeenCalledWith('mock-route-ref', {
        [`navigationData/updates/${navUpdate.userId}`]: {
          ...navUpdate,
          timestamp: mockServerTimestamp
        }
      });

    });
  });

  describe('endNavigation', () => {
    it('should end navigation session', async () => {
      const mockRef = jest.mocked(ref);
      const mockUpdate = jest.mocked(update);
      const mockGet = jest.mocked(get);
      const mockServerTimestamp = jest.mocked(serverTimestamp);

      const mockRouteRef = 'mock-route-ref' as any;
      const mockSessionRef = 'mock-sessions-ref' as any;
      mockRef.mockReturnValueOnce(mockRouteRef).mockReturnValueOnce(mockSessionRef);
      mockServerTimestamp.mockReturnValue(serverTimestamp);
      mockUpdate.mockResolvedValue(undefined as any);


      const mockSessionDoc = {
        ref: 'mock-session-ref'
      };
      mockGet.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback(mockSessionDoc);
        }
      } as any);

      await NavigationService.endNavigation('route123', 'user456');
      expect(mockRef).toHaveBeenCalledWith(rtdb, 'routes/route123');
      expect(mockUpdate).toHaveBeenNthCalledWith(1, mockRouteRef, {
        'navigationData/currentStatus': 'completed',
        'navigationData/activeNavigators/user456': null,
        'navigationData/lastUpdated': mockServerTimestamp
      });

    });
  });
});

  // describe('getRoute', () => {
  //   it('should return route when it exists', async () => {
  //     const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
  //     const mockDoc = doc as jest.MockedFunction<typeof doc>;

  //     mockDoc.mockReturnValue('mock-route-ref' as any);
      
  //     const mockRouteData = {
  //       name: 'Test Route',
  //       creatorId: 'user-123',
  //       waypoints: []
  //     };

  //     mockGetDoc.mockResolvedValue({
  //       exists: () => true,
  //       id: 'route-123',
  //       data: () => mockRouteData
  //     } as any);

  //     const result = await NavigationService.getRoute('route-123');

  //     expect(result).toEqual({
  //       id: 'route-123',
  //       ...mockRouteData
  //     });
  //   });

  //   it('should return null when route does not exist', async () => {
  //     const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
  //     const mockDoc = doc as jest.MockedFunction<typeof doc>;

  //     mockDoc.mockReturnValue('mock-route-ref' as any);
  //     mockGetDoc.mockResolvedValue({
  //       exists: () => false
  //     } as any);

  //     const result = await NavigationService.getRoute('route-123');

  //     expect(result).toBeNull();
  //   });

  //   it('should handle errors gracefully', async () => {
  //     const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
  //     const mockDoc = doc as jest.MockedFunction<typeof doc>;

  //     mockDoc.mockReturnValue('mock-route-ref' as any);
  //     mockGetDoc.mockRejectedValue(new Error('Firestore error'));

  //     const result = await NavigationService.getRoute('route-123');

  //     expect(result).toBeNull();
  //   });
  // });
});