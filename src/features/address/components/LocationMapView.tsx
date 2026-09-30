import { COLORS } from "@/constants/theme";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type {
  LocationMapViewHandle,
  LocationMapViewProps,
} from "./LocationMapView.types";

type Props = LocationMapViewProps & {
  userLocation?: { latitude: number; longitude: number } | null;
};

// "liberty" : nhiều màu, chi tiết, giống ảnh mẫu nhất
// "positron": trắng xám tối giản, nổi bật marker
// "bright"  : sáng, màu đậm hơn
const MAP_STYLE = "liberty";

const LocationMapView = forwardRef<LocationMapViewHandle, Props>(
  ({ initialRegion, onRegionChangeComplete, userLocation }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const loadedRef = useRef(false);

    const onChangeRef = useRef(onRegionChangeComplete);
    onChangeRef.current = onRegionChangeComplete;

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        webviewRef.current?.injectJavaScript(`
          window.flyToPoint(${region.latitude}, ${region.longitude});
          true;
        `);
      },
    }));

    const pushUser = (loc?: Props["userLocation"]) => {
      if (!loc || !loadedRef.current) return;
      webviewRef.current?.injectJavaScript(`
        window.setUser && window.setUser(${loc.latitude}, ${loc.longitude});
        true;
      `);
    };

    useEffect(() => {
      pushUser(userLocation);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation?.latitude, userLocation?.longitude]);

    const source = useMemo(
      () => ({
        baseUrl: "https://localhost",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
          <style>
            html, body, #map {
              height: 100%; margin: 0; padding: 0;
              background-color: #eef3f4;
              -webkit-tap-highlight-color: transparent;
            }
            .maplibregl-ctrl-attrib {
              font-size: 8px !important;
              opacity: 0.6;
            }

            .me-wrap { position: relative; width: 22px; height: 22px; }
            .me-pulse {
              position: absolute; inset: -14px;
              border-radius: 50%;
              background: rgba(245, 158, 11, 0.28);
              animation: pulse 2s ease-out infinite;
            }
            .me-dot {
              position: absolute; inset: 3px;
              border-radius: 50%;
              background: #f59e0b;
              border: 3px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
            @keyframes pulse {
              0%   { transform: scale(0.5); opacity: 0.9; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          </style>
        </head>
        <body>
          <div id="map"></div>

          <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
          <script>
            // MapLibre dùng [lng, lat]; zoom MapLibre thấp hơn Leaflet khoảng 1 mức
            const map = new maplibregl.Map({
              container: 'map',
              style: 'https://tiles.openfreemap.org/styles/${MAP_STYLE}',
              center: [${initialRegion.longitude}, ${initialRegion.latitude}],
              zoom: 15,
              minZoom: 4,
              maxZoom: 19,
              attributionControl: false,
              dragRotate: false,
              pitchWithRotate: false
            });
            map.touchZoomRotate.disableRotation();
            map.addControl(new maplibregl.AttributionControl({ compact: true }));

            let meMarker = null;
            window.setUser = function (lat, lng) {
              if (meMarker) {
                meMarker.setLngLat([lng, lat]);
                return;
              }
              const el = document.createElement('div');
              el.className = 'me-wrap';
              el.innerHTML = '<div class="me-pulse"></div><div class="me-dot"></div>';
              meMarker = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map);
            };

            window.flyToPoint = function (lat, lng) {
              map.flyTo({ center: [lng, lat], zoom: 16, duration: 1100, essential: true });
            };

            // Chỉ báo tâm bản đồ khi thật sự đổi chỗ, tránh vòng lặp geocode
            let lastSent = null;
            let timer = null;
            const EPS = 0.00002; // ~2m

            function sendCenter() {
              const c = map.getCenter();
              if (
                lastSent &&
                Math.abs(c.lat - lastSent.lat) < EPS &&
                Math.abs(c.lng - lastSent.lng) < EPS
              ) {
                return;
              }
              lastSent = { lat: c.lat, lng: c.lng };
              window.ReactNativeWebView.postMessage(JSON.stringify({
                latitude: c.lat,
                longitude: c.lng
              }));
            }

            map.on('moveend', function () {
              clearTimeout(timer);
              timer = setTimeout(sendCenter, 150);
            });
            // MapLibre không tự bắn moveend lúc khởi tạo, nên báo tâm ban đầu tại đây
            map.on('load', sendCenter);

            ${
              userLocation
                ? `window.setUser(${userLocation.latitude}, ${userLocation.longitude});`
                : ""
            }
          </script>
        </body>
      </html>
    `,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    return (
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={source}
        onLoadEnd={() => {
          loadedRef.current = true;
          pushUser(userLocation);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            onChangeRef.current({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } catch (e) {
            console.log("WebView message parse error", e);
          }
        }}
        style={{ flex: 1, backgroundColor: "#eef3f4" }}
        javaScriptEnabled
        domStorageEnabled
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        androidLayerType="hardware"
        startInLoadingState
        renderLoading={() => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#eef3f4",
              },
            ]}
          >
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}
      />
    );
  },
);

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
