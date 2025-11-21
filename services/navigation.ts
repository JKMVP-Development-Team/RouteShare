import { child, get, push, ref, serverTimestamp, set, update } from 'firebase/database';
import { RouteDocument } from '../constants/route';
import { rtdb } from './firebase';
import { LocationCoordinate } from './location';

export interface NavigationUpdate {
  routeId: string;
  userId: string;
  currentLocation: LocationCoordinate;
  remainingDistance: number; // meters
  remainingTime: number; // seconds
  speed: number; // km/h
  timestamp: number;
}

export interface NavigationSession {
  routeId: string;
  userId: string;
  startedAt: number;
  status: 'active' | 'paused' | 'completed';
  currentLocation?: LocationCoordinate;
}


export class NavigationService {
  
  /**
   * Start a navigation session for a route
   * @param routeId - The ID of the route
   * @param userId - The ID of the user
   */
  static async startNavigation(routeId: string, userId: string): Promise<void> {
    const routeRef = ref(rtdb, `routes/${routeId}`);
    
    await update(routeRef, {
      'navigationData/currentStatus': 'active',
      [`navigationData/activeNavigators/${userId}`]: true,
      'navigationData/lastUpdated': serverTimestamp()
    });

    // Create navigation session
    const sessionRef = push(ref(rtdb, 'navigationSessions'));
    await set(sessionRef, {
      routeId,
      userId,
      startedAt: serverTimestamp(),
      status: 'active'
    } as Omit<NavigationSession, 'startedAt'> & { startedAt: any});

    console.log(`Navigation started for route ${routeId} by user ${userId}`);
  }

  /**
   * Update navigation progress with current location and status
   * @param navUpdate - Navigation update data
   */
  static async updateNavigationProgress(navUpdate: NavigationUpdate): Promise<void> {
    // Also update the route document with latest info
    const routeRef = ref(rtdb, 'routes/' + navUpdate.routeId);
    await update(routeRef, {
        [`navigationData/updates/${navUpdate.userId}`]: {
        ...navUpdate,
        timestamp: serverTimestamp()
        }
    });
  }

  /**
   * End a navigation session
   * @param routeId - The ID of the route
   * @param userId - The ID of the user
   */
  static async endNavigation(routeId: string, userId: string): Promise<void> {
    const routeRef = ref(rtdb, 'routes/' + routeId);
    
    await update(routeRef, {
      'navigationData/currentStatus': "completed",
      [`navigationData/activeNavigators/${userId}`]: null,
      'navigationData/lastUpdated': serverTimestamp()
    });
    
    console.log(`Navigation ended for route ${routeId} by user ${userId}`);
  }

  

  /**
   * Listen to real-time navigation updates for a route
   * @param routeId - The ID of the route
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  // static subscribeToNavigationUpdates(
  //   routeId: string, 
  //   callback: (updates: NavigationUpdate[]) => void
  // ): () => void {
  //   const updatesRef = ref(rtdb, `navigationUpdates/routeId/${routeId}`);
  //   const updatesQuery = query(updatesRef, orderByValue());

  //   // Maybe should be a pubsub function?

  //   // return onSnapshot(updatesQuery, (snapshot) => {
  //   //   const updates = snapshot.docs.map(doc => ({
  //   //     id: doc.id,
  //   //     ...doc.data()
  //   //   })) as (NavigationUpdate & { id: string })[];
      
  //   //   callback(updates);

    
  //   // });
  // }

  /**
   * Get a route by ID
   * @param routeId - The ID of the route
   * @returns Route document or null if not found
   */
  static async getRoute(routeId: string): Promise<RouteDocument | null> {
    let routeSnap = null;

    try {
      get(child(ref(rtdb), `routes/${routeId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          routeSnap = snapshot.val();
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
      
      return { routeSnap } as unknown as RouteDocument; // TODO Potential issue
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  /**
   * Get active users in a navigation session
   * @returns Array of active users in a session
   */
  // static async getActiveNavigators(): Promise<string[]> {
  //   try {
  //     const sessionsRef = ref(rtdb, 'navigationSessions');
  //     const activeQuery = get(child(sessionsRef, "userId")).then((snapshot) => {
  //       if (snapshot.exists()) {
  //         snapshot.forEach(snapshot.val) => {

  //         }
  //         return snapshot.val();
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error getting active navigators:', error);
  //     return [];
  //   }
  // }
}