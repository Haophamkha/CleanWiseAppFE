import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ImageSourcePropType } from "react-native";

// true: PNG BE là silhouette 1 màu, tô theo `color`.
// false: PNG nhiều màu, giữ nguyên màu gốc.
const TINT_REMOTE_ICON = true;

type Props = {
  uri?: string | null; // service.icon từ BE
  bundled?: ImageSourcePropType; // require("...png") nếu có
  fallbackName: string; // tên MaterialCommunityIcons
  size: number;
  color: string;
};

export function ServiceIcon({
  uri,
  bundled,
  fallbackName,
  size,
  color,
}: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (uri && failedUri !== uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          ...(TINT_REMOTE_ICON ? { tintColor: color } : null),
        }}
        resizeMode="contain"
        onError={() => setFailedUri(uri)}
      />
    );
  }

  if (bundled) {
    return (
      <Image
        source={bundled}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={fallbackName as any}
      size={size}
      color={color}
    />
  );
}
