
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
  
  // Route metadata
  category: 'walking' | 'driving' | 'cycling' | 'transit';
  estimatedTime: number; // minutes
  isPublic: boolean;
  tags: string[];

}

