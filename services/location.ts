import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export class LocationService {
  /**
   * Request location permissions from the user
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied', 
          'Location permission is required to show your current location'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get the current user location
   * @returns Promise<Location.LocationObject | null>
   */
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log('Current location:', location.coords);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Could not get your current location');
      return null;
    }
  }

  /**
   * Watch user location changes
   * @param callback - Function to call when location changes
   * @returns Promise<Location.LocationSubscription | null>
   */
  static async watchLocation(
    callback: (location: Location.LocationObject) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        callback
      );
      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  /**
   * Calculate map region that includes all given locations
   * @param locations - Array of coordinates to include
   * @param paddingFactor - Padding factor for the region (default: 1.5)
   * @returns MapRegion
   */
  static calculateMapRegion(
    locations: LocationCoordinate[], 
    paddingFactor: number = 1.5
  ): MapRegion {
    if (locations.length === 0) {
      // Default to San Francisco if no locations
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (locations.length === 1) {
      // If only one location, center on it with small delta
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const lats = locations.map(loc => loc.latitude);
    const lngs = locations.map(loc => loc.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max((maxLat - minLat) * paddingFactor, 0.01);
    const deltaLng = Math.max((maxLng - minLng) * paddingFactor, 0.01);

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }

  /**
   * Calculate distance between two coordinates in kilometers
   * @param coord1 - First coordinate
   * @param coord2 - Second coordinate  
   * @returns distance in kilometers
   */
  static calculateDistance(coord1: LocationCoordinate, coord2: LocationCoordinate): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLng = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.latitude)) * 
              Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param degrees 
   * @returns radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format coordinates for display
   * @param coordinate 
   * @returns formatted string
   */
  static formatCoordinate(coordinate: LocationCoordinate): string {
    return `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;
  }
}