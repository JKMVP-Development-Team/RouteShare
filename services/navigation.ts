import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { RouteDocument } from '../constants/route';
import { db } from './firebase';
import { LocationCoordinate } from './location';

export interface NavigationUpdate {
  routeId: string;
  userId: string;
  currentLocation: LocationCoordinate;
  remainingDistance: number; // meters
  remainingTime: number; // seconds
  speed: number; // km/h
  timestamp: Timestamp;
}

export interface NavigationSession {
  routeId: string;
  userId: string;
  startedAt: Timestamp;
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
    const routeRef = doc(db, 'routes', routeId);
    
    await updateDoc(routeRef, {
      'navigationData.currentStatus': 'active',
      'navigationData.activeNavigators': arrayUnion(userId),
      'navigationData.lastUpdated': Timestamp.now()
    });

    // Create navigation session
    const sessionRef = collection(db, 'navigationSessions');
    await addDoc(sessionRef, {
      routeId,
      userId,
      startedAt: Timestamp.now(),
      status: 'active'
    } as NavigationSession);

    console.log(`Navigation started for route ${routeId} by user ${userId}`);
  }

  /**
   * Update navigation progress with current location and status
   * @param update - Navigation update data
   */
  static async updateNavigationProgress(update: NavigationUpdate): Promise<void> {
    const updatesRef = collection(db, 'navigationUpdates');
    
    await addDoc(updatesRef, {
      ...update,
      timestamp: Timestamp.now()
    });

    // Also update the route document with latest info
    const routeRef = doc(db, 'routes', update.routeId);
    await updateDoc(routeRef, {
      'navigationData.lastUpdated': Timestamp.now()
    });

    console.log(`Navigation progress updated for route ${update.routeId}`);
  }

  /**
   * End a navigation session
   * @param routeId - The ID of the route
   * @param userId - The ID of the user
   */
  static async endNavigation(routeId: string, userId: string): Promise<void> {
    const routeRef = doc(db, 'routes', routeId);
    
    await updateDoc(routeRef, {
      'navigationData.activeNavigators': arrayRemove(userId),
      'navigationData.lastUpdated': Timestamp.now()
    });

    // Update navigation session status
    const sessionsRef = collection(db, 'navigationSessions');
    const sessionQuery = query(
      sessionsRef,
      where('routeId', '==', routeId),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const sessionSnapshot = await getDocs(sessionQuery);
    sessionSnapshot.forEach(async (sessionDoc) => {
      await updateDoc(sessionDoc.ref, {
        status: 'completed',
        completedAt: Timestamp.now()
      });
    });

    console.log(`Navigation ended for route ${routeId} by user ${userId}`);
  }

  /**
   * Listen to real-time navigation updates for a route
   * @param routeId - The ID of the route
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  static subscribeToNavigationUpdates(
    routeId: string, 
    callback: (updates: NavigationUpdate[]) => void
  ): () => void {
    const updatesRef = collection(db, 'navigationUpdates');
    const updatesQuery = query(
      updatesRef,
      where('routeId', '==', routeId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(updatesQuery, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (NavigationUpdate & { id: string })[];
      
      callback(updates);
    });
  }

  /**
   * Get a route by ID
   * @param routeId - The ID of the route
   * @returns Route document or null if not found
   */
  static async getRoute(routeId: string): Promise<RouteDocument | null> {
    try {
      const routeRef = doc(db, 'routes', routeId);
      const routeSnap = await getDoc(routeRef);
      
      if (!routeSnap.exists()) {
        console.warn(`Route ${routeId} not found`);
        return null;
      }
      
      return { id: routeSnap.id, ...routeSnap.data() } as RouteDocument;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  /**
   * Get active navigation sessions for a route
   * @param routeId - The ID of the route
   * @returns Array of active navigation sessions
   */
  static async getActiveNavigators(routeId: string): Promise<NavigationSession[]> {
    try {
      const sessionsRef = collection(db, 'navigationSessions');
      const activeQuery = query(
        sessionsRef,
        where('routeId', '==', routeId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(activeQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (NavigationSession & { id: string })[];
    } catch (error) {
      console.error('Error getting active navigators:', error);
      return [];
    }
  }
}