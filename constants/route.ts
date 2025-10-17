
import { Timestamp } from "firebase/firestore";

export interface RouteDocument {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Route data
  waypoints: Array<{
    latitude: number;
    longitude: number;
    address?: string;
    order: number;
    type: 'start' | 'stop' | 'end';
    estimatedDuration?: number; // minutes to spend here
  }>;
  
  // Google Maps data
  googleMapsData?: {
    polyline: string; // Encoded polyline
    distance: number; // meters
    duration: number; // seconds
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  
  navigationData?: {
    routePolyline: string; // Encoded polyline from Google Maps
    estimatedDuration: number; // in seconds
    estimatedDistance: number; // in meters
    trafficConditions?: string;
    lastUpdated: Timestamp;
    currentStatus: 'planned' | 'active' | 'paused' | 'completed';
    activeNavigators?: string[]; // User IDs currently navigating
  };

  estimatedTime: number; // minutes
  isPublic: boolean;
  tags: string[];

}

export interface NavigationUpdate {
  routeId: string;
  userId: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  remainingDistance: number; // meters
  remainingTime: number; // seconds
  speed: number; // km/h
  timestamp: Timestamp;
}