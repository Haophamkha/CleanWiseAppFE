import { forwardRef, useImperativeHandle, useRef } from "react";
import { Text, View } from "react-native";
import MapView from "react-native-maps";
import {
  LocationMapViewHandle,
  LocationMapViewProps,
} from "./LocationMapView.types";

const LocationMapView = forwardRef<
  LocationMapViewHandle,
  LocationMapViewProps
>(({ initialRegion, onRegionChangeComplete }, ref) => {
  const mapRef = useRef<MapView>(null);

  console.log("🔥 MAP VIEW RENDER");

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 500) => {
      mapRef.current?.animateToRegion(region, duration);
    },
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 9999,
          backgroundColor: "white",
          color: "black",
          padding: 10,
        }}
      >
        TEST MAP
      </Text>

      <MapView
        ref={mapRef}
        provider="google"
        style={{
          width: 300,
          height: 300,
          alignSelf: "center",
          marginTop: 100,
        }}
        initialRegion={{
          latitude: 10.7769,
          longitude: 106.7009,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={() => {
          console.log("✅ MAP READY");
        }}
        onError={(event) => {
          console.log("❌ MAP ERROR", event.nativeEvent);
        }}
        onRegionChangeComplete={onRegionChangeComplete}
      />
    </View>
  );
});

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
