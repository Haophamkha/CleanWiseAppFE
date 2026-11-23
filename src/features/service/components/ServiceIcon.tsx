import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ENV } from "@/config/env";
import { useState } from "react";
import { Image, ImageSourcePropType } from "react-native";

// true: PNG BE là silhouette 1 màu, tô theo `color`.
// false: PNG nhiều màu, giữ nguyên màu gốc.
const TINT_REMOTE_ICON = true;

function resolveIconUri(u?: string | null): string | null {
  if (!u) return null;
  const base = ENV.API_URL.replace(/\/+$/, "");
  if (u.startsWith("/")) return base + u;
  return u.replace(/^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?/i, base);
}

type Props = {
  uri?: string | null; // service.icon từ BE
  bundled?: ImageSourcePropType; // require("...png") nếu có
  fallbackName: string; // tên MaterialCommunityIcons
  size: number;
  color: string;
};

export function ServiceIcon({
  uri: rawUri,
  bundled,
  fallbackName,
  size,
  color,
}: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const uri = resolveIconUri(rawUri);
  if (__DEV__) console.log("[ServiceIcon] uri", rawUri, "->", uri);

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
        onError={(e) => {
          if (__DEV__) {
            console.log("[ServiceIcon] load failed", uri, e.nativeEvent);
          }
          setFailedUri(uri);
        }}
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
