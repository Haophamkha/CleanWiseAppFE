import { forwardRef, useImperativeHandle } from "react";
import { Text, View } from "react-native";
import {
    LocationMapViewHandle,
    LocationMapViewProps,
} from "./LocationMapView.types";

const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  (_props, ref) => {
    useImperativeHandle(ref, () => ({
      animateToRegion: () => {
        // no-op trên web
      },
    }));

    return (
      <View className="flex-1 items-center justify-center bg-gray-100 px-8">
        <Text className="text-gray-500 text-center">
          Bản đồ chỉ hỗ trợ trên ứng dụng di động (iOS/Android). Hãy chạy app
          trên thiết bị hoặc simulator để dùng tính năng chọn vị trí.
        </Text>
      </View>
    );
  },
);

LocationMapView.displayName = "LocationMapView";

export default LocationMapView;
