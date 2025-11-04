# Using Maps in Expo/React Native

## ✅ Setup Complete!

I've set up **react-native-maps** for your Expo app, which works with TypeScript and React Native.

## 📦 What Was Installed

- `react-native-maps` - Cross-platform map component for iOS and Android
- Google Maps API keys configured in `app.json`

## 🗺️ How to Use Maps

### Basic Usage

```tsx
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker
    coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
    title="My Location"
    description="This is a marker"
  />
</MapView>
```

## 🎨 Key Features Available

### 1. **Markers**
```tsx
<Marker
  coordinate={{ latitude: 37.78, longitude: -122.43 }}
  title="Point A"
  description="Starting point"
  pinColor="red"
/>
```

### 2. **Routes (Polylines)**
```tsx
<Polyline
  coordinates={[
    { latitude: 37.78, longitude: -122.43 },
    { latitude: 37.79, longitude: -122.44 },
  ]}
  strokeColor="#007AFF"
  strokeWidth={4}
/>
```

### 3. **User Location**
```tsx
<MapView
  showsUserLocation={true}
  showsMyLocationButton={true}
/>
```

### 4. **Custom Markers**
```tsx
<Marker coordinate={{ latitude: 37.78, longitude: -122.43 }}>
  <View style={styles.customMarker}>
    <Text>🎯</Text>
  </View>
</Marker>
```

## 📍 Getting User Location

Install location permissions:
```bash
npx expo install expo-location
```

Then use:
```tsx
import * as Location from 'expo-location';

const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;
  
  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
```

## 🚀 Example Component

Check out `components/map-view-example.tsx` for a complete working example!

## 📱 Platform Support

- ✅ iOS (uses Apple Maps by default, Google Maps with PROVIDER_GOOGLE)
- ✅ Android (uses Google Maps)
- ✅ Web (limited support, consider using a different library for web)

## 🔑 API Keys

Your Google Maps API keys are configured in:
- **iOS**: `app.json` → `ios.config.googleMapsApiKey`
- **Android**: `app.json` → `android.config.googleMaps.apiKey`

## 📚 Additional Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)

## 💡 Tips for RouteShare

For your RouteShare app, you can use these maps features:

1. **Display routes** - Use `<Polyline>` to show shared routes
2. **Show friends' locations** - Use `<Marker>` for each friend
3. **Track user location** - Use `showsUserLocation` prop
4. **Create new routes** - Handle map press events to add waypoints
5. **Animate to regions** - Use `animateToRegion()` method

## 🎯 Next Steps

1. Try the example component: Import `MapViewExample` in any screen
2. Add location permissions to your app
3. Customize the map style to match your app theme
4. Build your route-sharing features!

Let me know if you need help implementing any specific map features!
