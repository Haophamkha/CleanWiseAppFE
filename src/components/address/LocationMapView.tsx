import { forwardRef, useImperativeHandle, useRef } from "react";
import { WebView } from "react-native-webview";
import type {
  LocationMapViewHandle,
  LocationMapViewProps,
} from "./LocationMapView.types";

const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  ({ initialRegion, onRegionChangeComplete }, ref) => {
    const webviewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        webviewRef.current?.injectJavaScript(`
          map.setView([${region.latitude}, ${region.longitude}], 16);
          true;
        `);
      },
    }));

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            const map = L.map('map', { zoomControl: false }).setView(
              [${initialRegion.latitude}, ${initialRegion.longitude}], 16
            );
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            function sendCenter() {
              const c = map.getCenter();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                latitude: c.lat,
                longitude: c.lng
              }));
            }

            map.on('moveend', sendCenter);
          </script>
        </body>
      </html>
    `;

    return (
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          onRegionChangeComplete({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }}
        style={{ flex: 1 }}
      />
    );
  },
);

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
