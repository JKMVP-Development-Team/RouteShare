import { LocationCoordinate, LocationService } from '../services/location';

describe('LocationService', () => {
  describe('calculateMapRegion', () => {
    it('should return default region for empty locations array', () => {
      const region = LocationService.calculateMapRegion([]);
      
      expect(region).toEqual({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    });

    it('should return small delta region for single location', () => {
      const locations: LocationCoordinate[] = [
        { latitude: 37.7749, longitude: -122.4194 }
      ];
      
      const region = LocationService.calculateMapRegion(locations);
      
      expect(region).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should calculate proper region for multiple locations', () => {
      const locations: LocationCoordinate[] = [
        { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
        { latitude: 37.4419, longitude: -122.1430 }, // Stanford
        { latitude: 37.8044, longitude: -122.2711 }, // Berkeley
      ];
      
      const region = LocationService.calculateMapRegion(locations);
      
      // Should center between all points
      expect(region.latitude).toBeCloseTo(37.6231, 3);
      expect(region.longitude).toBeCloseTo(-122.2812, 3);
      
      // Should have reasonable deltas with padding
      expect(region.latitudeDelta).toBeGreaterThan(0.3);
      expect(region.longitudeDelta).toBeGreaterThan(0.1);
    });

    it('should apply custom padding factor', () => {
      const locations: LocationCoordinate[] = [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.4419, longitude: -122.1430 },
      ];
      
      const region1 = LocationService.calculateMapRegion(locations, 1.0);
      const region2 = LocationService.calculateMapRegion(locations, 2.0);
      
      // Larger padding should result in larger deltas
      expect(region2.latitudeDelta).toBeGreaterThan(region1.latitudeDelta);
      expect(region2.longitudeDelta).toBeGreaterThan(region1.longitudeDelta);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const coord1: LocationCoordinate = { latitude: 37.7749, longitude: -122.4194 }; // SF
      const coord2: LocationCoordinate = { latitude: 37.4419, longitude: -122.1430 }; // Stanford
      
      const distance = LocationService.calculateDistance(coord1, coord2);
      
      // Distance between SF and Stanford is approximately 44 km
      expect(distance).toBeCloseTo(44, 0);
    });

    it('should return 0 for identical coordinates', () => {
      const coord: LocationCoordinate = { latitude: 37.7749, longitude: -122.4194 };
      
      const distance = LocationService.calculateDistance(coord, coord);
      
      expect(distance).toBeCloseTo(0, 5);
    });

    it('should handle coordinates across different hemispheres', () => {
      const coord1: LocationCoordinate = { latitude: 40.7128, longitude: -74.0060 }; // NYC
      const coord2: LocationCoordinate = { latitude: 51.5074, longitude: -0.1278 };  // London
      
      const distance = LocationService.calculateDistance(coord1, coord2);
      
      // Distance between NYC and London is approximately 5585 km
      expect(distance).toBeCloseTo(5585, -2); // Within 100km accuracy
    });
  });

  describe('formatCoordinate', () => {
    it('should format coordinates with 6 decimal places', () => {
      const coordinate: LocationCoordinate = { 
        latitude: 37.774929, 
        longitude: -122.419416 
      };
      
      const formatted = LocationService.formatCoordinate(coordinate);
      
      expect(formatted).toBe('37.774929, -122.419416');
    });

    it('should handle coordinates with more precision', () => {
      const coordinate: LocationCoordinate = { 
        latitude: 37.77492912345, 
        longitude: -122.41941654321 
      };
      
      const formatted = LocationService.formatCoordinate(coordinate);
      
      expect(formatted).toBe('37.774929, -122.419417');
    });
  });
});