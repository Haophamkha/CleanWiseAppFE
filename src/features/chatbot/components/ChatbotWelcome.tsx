import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Suggestion = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  text: string;
};

const QUESTIONS: Suggestion[] = [
  {
    icon: "calendar",
    title: "Đặt lịch dịch vụ",
    text: "Tôi muốn đặt lịch dịch vụ.",
  },
  {
    icon: "grid",
    title: "Tìm dịch vụ phù hợp",
    text: "CleanWise có những dịch vụ nào?",
  },
  {
    icon: "package",
    title: "Tra đơn và lịch sắp tới",
    text: "Cho tôi xem đơn gần nhất và lịch dịch vụ sắp tới.",
  },
  {
    icon: "credit-card",
    title: "Hướng dẫn thanh toán",
    text: "Hướng dẫn tôi các phương thức và các bước thanh toán dịch vụ trên CleanWise.",
  },
];

const MORE_QUESTIONS: Suggestion[] = [
  {
    icon: "rotate-ccw",
    title: "Đặt lại đơn cũ",
    text: "Đặt lại như lần trước giúp tôi.",
  },
  {
    icon: "x-circle",
    title: "Hủy đơn hoặc hủy buổi",
    text: "Tôi muốn hủy một đơn.",
  },
  {
    icon: "map-pin",
    title: "Thêm địa chỉ mới",
    text: "Tôi muốn thêm một địa chỉ mới.",
  },
  {
    icon: "dollar-sign",
    title: "Xem số dư ví",
    text: "Ví CleanWise của tôi còn bao nhiêu?",
  },
  {
    icon: "credit-card",
    title: "Kiểm tra thanh toán",
    text: "Đơn gần nhất của tôi đã thanh toán chưa?",
  },
  {
    icon: "book-open",
    title: "Hướng dẫn đặt dịch vụ",
    text: "Hướng dẫn tôi các bước đặt đơn dịch vụ.",
  },
];

export function ChatbotWelcome({
  onAsk,
  disabled,
}: {
  onAsk: (text: string) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const questions = expanded ? [...QUESTIONS, ...MORE_QUESTIONS] : QUESTIONS;
  return (
    <View className="px-5 py-6">
      <View className="w-16 h-16 rounded-3xl bg-primary-light items-center justify-center mb-4">
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={36}
          color={COLORS.primaryDark}
        />
      </View>
      <Text className="text-ink text-[23px] font-extrabold">
        Tôi có thể giúp gì cho bạn?
      </Text>
      <Text className="text-ink-soft text-sm leading-6 mt-2 mb-5">
        Tìm dịch vụ, đặt lịch, hủy đơn, xem đơn hàng và ví, hoặc hỏi hướng dẫn
        có nguồn tham khảo. Với đặt lịch và hủy đơn, tôi luôn hỏi xác nhận trước
        khi thực hiện.
      </Text>
      <View style={{ gap: 10 }}>
        {questions.map((question) => (
          <TouchableOpacity
            key={question.title}
            onPress={() => onAsk(question.text)}
            disabled={disabled}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={question.title}
            className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3.5"
          >
            <View className="w-9 h-9 rounded-xl bg-primary-soft items-center justify-center mr-3">
              <Feather
                name={question.icon}
                size={17}
                color={COLORS.primaryDark}
              />
            </View>
            <Text className="flex-1 text-ink font-semibold text-sm">
              {question.title}
            </Text>
            <Feather name="arrow-up-right" size={17} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setExpanded((value) => !value)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Thu gọn gợi ý" : "Xem thêm gợi ý"}
          accessibilityState={{ expanded }}
          className="flex-row items-center justify-center py-3"
        >
          <Text className="text-primary-dark font-semibold text-sm mr-2">
            {expanded ? "Thu gọn gợi ý" : "Xem thêm gợi ý"}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={17}
            color={COLORS.primaryDark}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
