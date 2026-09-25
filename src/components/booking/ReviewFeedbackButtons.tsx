import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function ReviewFeedbackButtons({
  onReview,
  onFeedback,
  style,
}: {
  onReview?: () => void;
  onFeedback?: () => void;
  style?: object;
}) {
  return (
    <View className="flex-row" style={[{ gap: 12 }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onReview}
        className="flex-1 rounded-2xl p-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#FDE68A",
          shadowColor: "#F59E0B",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 1,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2.5"
          style={{ backgroundColor: "#FEF3C7" }}
        >
          <Feather name="star" size={18} color="#B45309" />
        </View>
        <Text className="text-[14.5px] font-bold text-gray-900">Đánh giá</Text>
        <Text className="text-[12px] text-gray-400 mt-0.5">
          Chia sẻ trải nghiệm
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onFeedback}
        className="flex-1 rounded-2xl p-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#FECACA",
          shadowColor: "#EF4444",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 1,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2.5"
          style={{ backgroundColor: "#FEE2E2" }}
        >
          <Feather name="alert-circle" size={18} color="#B91C1C" />
        </View>
        <Text className="text-[14.5px] font-bold text-gray-900">Phản hồi</Text>
        <Text className="text-[12px] text-gray-400 mt-0.5">
          Báo vấn đề phát sinh
        </Text>
      </TouchableOpacity>
    </View>
  );
}
