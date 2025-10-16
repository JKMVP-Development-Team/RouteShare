import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapViewExampleProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function MapViewExample({ initialRegion }: MapViewExampleProps) {
  const [region, setRegion] = useState(initialRegion || {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markers, setMarkers] = useState([
    {
      id: '1',
      coordinate: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      title: 'Start Point',
      description: 'This is where the route starts',
    },
    {
      id: '2',
      coordinate: {
        latitude: 37.79025,
        longitude: -122.4324,
      },
      title: 'End Point',
      description: 'This is where the route ends',
    },
  ]);

  // Example route coordinates
  const routeCoordinates = [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4324 },
    { latitude: 37.79025, longitude: -122.4324 },
  ];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // Use Google Maps
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Add markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}

        {/* Add route polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
      </MapView>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Latitude: {region.latitude.toFixed(4)}
        </Text>
        <Text style={styles.infoText}>
          Longitude: {region.longitude.toFixed(4)}
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
    width: '100%',
    height: '100%',
  },
  info: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
