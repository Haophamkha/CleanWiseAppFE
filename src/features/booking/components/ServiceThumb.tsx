import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Image, View } from "react-native";

type FeatherName = keyof typeof Feather.glyphMap;

// Đoán icon theo tên dịch vụ (tạm thời, chỉnh lại theo dịch vụ thật của bạn)
const KEYWORD_ICONS: { keywords: string[]; icon: FeatherName }[] = [
  { keywords: ["máy lạnh", "điều hòa", "may lanh"], icon: "wind" },
  { keywords: ["chuyển nhà", "chuyển văn phòng"], icon: "truck" },
  { keywords: ["giặt", "sofa", "thảm", "nệm"], icon: "droplet" },
  { keywords: ["sửa", "bảo trì", "điện", "nước"], icon: "tool" },
  { keywords: ["dọn", "vệ sinh nhà", "tổng vệ sinh"], icon: "home" },
];

function guessIcon(name: string): FeatherName | null {
  const n = name.toLowerCase();
  return (
    KEYWORD_ICONS.find((k) => k.keywords.some((w) => n.includes(w)))?.icon ??
    null
  );
}

export function ServiceThumb({
  imageUrl,
  serviceName,
  fallbackIcon,
  tint,
  bg,
  size = 56,
}: {
  imageUrl?: string | null;
  serviceName: string;
  fallbackIcon: FeatherName;
  tint: string;
  bg: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!imageUrl && !failed;
  const icon = guessIcon(serviceName) ?? fallbackIcon;
  const usingGuessedIcon = icon !== fallbackIcon;

  return (
    <View
      className="rounded-2xl items-center justify-center mr-3 overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: showImage
          ? COLORS.canvas
          : usingGuessedIcon
            ? COLORS.primaryLight
            : bg,
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Feather
          name={icon}
          size={size * 0.44}
          color={usingGuessedIcon ? COLORS.primaryDark : tint}
        />
      )}
    </View>
  );
}
