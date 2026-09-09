import { forwardRef, useImperativeHandle, useRef } from "react";
import MapView from "react-native-maps";
import {
    LocationMapViewHandle,
    LocationMapViewProps,
} from "./LocationMapView.types";

const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  ({ initialRegion, onRegionChangeComplete }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));

    return (
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
      />
    );
  },
);

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
