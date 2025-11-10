import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RouteDocument } from '../constants/route';
import { LocationService, type LocationCoordinate, type MapRegion } from '../services/location';

interface NavigationViewProps {
  route: RouteDocument;
  userId: string;
  onNavigationUpdate?: (update: any) => void;
  style?: any;
}

export default function NavView({ 
  route, 
  userId, 
  onNavigationUpdate,
  style 
}: NavigationViewProps) {
  
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const hasPermission = await LocationService.requestLocationPermission();
    if (hasPermission) {
      setHasLocationPermission(true);
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    const location = await LocationService.getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
    }
  };
  
  // Calculate map region based on waypoints and current location
  const getMapRegion = (): MapRegion => {
    const locations: LocationCoordinate[] = [
      ...route.waypoints.map(wp => ({ 
        latitude: wp.latitude, 
        longitude: wp.longitude 
      }))
    ];
    
    // Add current location if available
    if (currentLocation) {
      locations.push({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
    }
    
    return LocationService.calculateMapRegion(locations);
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={getMapRegion()}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={hasLocationPermission}
        followsUserLocation={true}
        userLocationUpdateInterval={5000}
        userLocationAnnotationTitle="You are here"
      >
        {route.waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
            }}
            title={waypoint.address || `Waypoint ${index + 1}`}
            description={`Order: ${waypoint.order}`}
            pinColor={waypoint.type === 'start' ? 'green' : waypoint.type === 'end' ? 'red' : 'orange'}
          />
        ))}
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Navigation Preview</Text>
        <Text style={styles.overlaySubtext}>Route: {route.name}</Text>
        <Text style={styles.overlaySubtext}>
          Location: {hasLocationPermission ? 
            (currentLocation ? 'Found' : 'Searching...') : 
            'Permission needed'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overlaySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});