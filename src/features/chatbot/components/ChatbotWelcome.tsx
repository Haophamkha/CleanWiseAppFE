import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const QUESTIONS = [
  {
    icon: "book-open" as const,
    title: "Hướng dẫn đặt dịch vụ",
    text: "Hướng dẫn tôi các bước đặt đơn dịch vụ.",
  },
  {
    icon: "grid" as const,
    title: "Tìm dịch vụ phù hợp",
    text: "CleanWise có những dịch vụ nào?",
  },
  {
    icon: "package" as const,
    title: "Tra đơn và lịch sắp tới",
    text: "Cho tôi xem đơn gần nhất và lịch dịch vụ sắp tới.",
  },
  {
    icon: "credit-card" as const,
    title: "Hướng dẫn thanh toán",
    text: "Hướng dẫn tôi các phương thức và các bước thanh toán dịch vụ trên CleanWise.",
  },
];

const MORE_QUESTIONS = [
  {
    icon: "dollar-sign" as const,
    title: "Nạp tiền vào ví",
    text: "Làm thế nào để nạp tiền vào Ví CleanWise?",
  },
  {
    icon: "calendar" as const,
    title: "Xem lịch sắp tới",
    text: "Ngày mai tôi có lịch dịch vụ nào?",
  },
  {
    icon: "credit-card" as const,
    title: "Kiểm tra thanh toán",
    text: "Đơn gần nhất của tôi đã thanh toán chưa?",
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
        Tìm dịch vụ, tra đơn và xem hướng dẫn đặt dịch vụ, thanh toán có nguồn tham khảo.
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
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={17} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
