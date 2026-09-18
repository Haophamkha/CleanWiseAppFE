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
          map.flyTo([${region.latitude}, ${region.longitude}], 17, {
            duration: 1.2
          });
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
            html, body, #map { height: 100%; margin: 0; padding: 0; background-color: #f3f4f6; }
            .leaflet-control-attribution {
              font-size: 7px !important;
              opacity: 0.4;
              background: rgba(255, 255, 255, 0.6) !important;
              padding: 0 3px !important;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            const map = L.map('map', { 
              zoomControl: false,
              tap: true,
              fadeAnimation: true,
              zoomAnimation: true
            }).setView(
              [${initialRegion.latitude}, ${initialRegion.longitude}], 16
            );

            // Dùng Esri World Street Map - Màu sắc tươi sáng, chi tiết đường xá cực đẹp, không cần API Key
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
              maxZoom: 19,
              attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
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
          try {
            const data = JSON.parse(event.nativeEvent.data);
            onRegionChangeComplete({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } catch (e) {
            console.log("WebView message parse error", e);
          }
        }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    );
  },
);

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
