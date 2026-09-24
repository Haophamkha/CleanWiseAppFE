import { COLORS } from "@/components/service/formFieldShared";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import { Text, View } from "react-native";

// ============================================================
// Cleaning Mascot
// ============================================================

const cleaningAnimation = require("../../../assets/animations/cleanwise.json");

function CleaningMascot({ size = 150 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LottieView
        source={cleaningAnimation}
        autoPlay
        loop
        speed={1}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}

// ============================================================
// LoadingOverlay
// ============================================================

export function LoadingOverlay({
  visible = true,
  text = "Đang tải...",
  fullscreen = false,
  size = 150,
}: {
  visible?: boolean;
  text?: string;
  fullscreen?: boolean;
  size?: number;
}) {
  if (!visible) return null;

  // Inline (không fullscreen): giữ đơn giản, không cần blur/card,
  // chỉ dùng khi chèn trong 1 khối nội dung đang tải riêng lẻ.
  if (!fullscreen) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 28,
        }}
      >
        <CleaningMascot size={size} />
        {!!text && (
          <Text
            style={{
              marginTop: -2,
              color: COLORS.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {text}
          </Text>
        )}
      </View>
    );
  }

  // Fullscreen: chỉ làm nhoè nhẹ màn phía sau (frosted glass), KHÔNG phủ tối.
  // Bỏ hẳn border/shadow quanh khối mascot — để mascot + chữ nổi tự nhiên
  // ngay trên lớp blur, không còn viền thẻ bo góc như trước.
  return (
    <BlurView intensity={35} tint="light" style={fullscreenStyle}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CleaningMascot size={size} />
        {!!text && (
          <Text
            style={{
              marginTop: -2,
              color: COLORS.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {text}
          </Text>
        )}
      </View>
    </BlurView>
  );
}

// ============================================================
// Fullscreen loading
// Không dùng lớp phủ tối nữa — BlurView tự tạo hiệu ứng
// kính mờ (frosted glass), màn cũ vẫn thấy hình dạng phía sau.
// ============================================================

const fullscreenStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  alignItems: "center" as const,
  justifyContent: "center" as const,

  zIndex: 999,
};
