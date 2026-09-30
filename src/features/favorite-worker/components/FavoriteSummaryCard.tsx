import { COLORS } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

export function FavoriteSummaryCard({ count }: { count: number }) {
  return (
    <LinearGradient
      colors={[COLORS.accent, COLORS.accentDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Vòng tròn trang trí */}
      <View
        style={{
          position: "absolute",
          right: -24,
          top: -32,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 40,
          bottom: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.10)",
        }}
      />

      <Text
        style={{
          fontSize: 40,
          lineHeight: 46,
          fontWeight: "800",
          color: "#FFFFFF",
        }}
      >
        {count}
      </Text>

      <View
        style={{
          width: 1,
          height: 36,
          marginHorizontal: 16,
          backgroundColor: "rgba(255,255,255,0.4)",
        }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
          Nhân viên yêu thích
        </Text>
        <Text
          style={{
            marginTop: 2,
            fontSize: 13,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          Đã lưu trong danh sách của bạn
        </Text>
      </View>
    </LinearGradient>
  );
}
