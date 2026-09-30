import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export type BrandName = "zalo" | "facebook" | "email" | "phone";

export const BRAND_COLORS: Record<BrandName, string> = {
  zalo: "#0068FF",
  facebook: "#1877F2",
  email: "#EA4335",
  phone: COLORS.success,
};

type Props = { name: BrandName; size?: number };

// Icon thương hiệu, không có nền (dùng trong ô tròn/ô vuông do nơi gọi tự bọc)
export function BrandIcon({ name, size = 24 }: Props) {
  const color = BRAND_COLORS[name];

  if (name === "zalo") {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: size * 0.34,
            letterSpacing: -0.3,
          }}
        >
          Zalo
        </Text>
      </View>
    );
  }
  if (name === "facebook") {
    return <MaterialCommunityIcons name="facebook" size={size} color={color} />;
  }
  if (name === "email") {
    return <MaterialCommunityIcons name="gmail" size={size} color={color} />;
  }
  return <Feather name="phone" size={size * 0.85} color={color} />;
}
