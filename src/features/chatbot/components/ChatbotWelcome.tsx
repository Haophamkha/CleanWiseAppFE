import { useTranslation } from "react-i18next";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Suggestion = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  text: string;
};

function getLocalizedQuestions(): Suggestion[] {
  return [
    {
      icon: "calendar",
      title: t("Đặt lịch dịch vụ"),
      text: t("Tôi muốn đặt lịch dịch vụ."),
    },
    {
      icon: "grid",
      title: t("Tìm dịch vụ phù hợp"),
      text: t("CleanWise có những dịch vụ nào?"),
    },
    {
      icon: "package",
      title: t("Tra đơn và lịch sắp tới"),
      text: t("Cho tôi xem đơn gần nhất và lịch dịch vụ sắp tới."),
    },
    {
      icon: "credit-card",
      title: t("Hướng dẫn thanh toán"),
      text: t("Hướng dẫn tôi các phương thức và các bước thanh toán dịch vụ trên CleanWise."),
    },
  ];
}

function getLocalizedMoreQuestions(): Suggestion[] {
  return [
    {
      icon: "rotate-ccw",
      title: t("Đặt lại đơn cũ"),
      text: t("Đặt lại như lần trước giúp tôi."),
    },
    {
      icon: "x-circle",
      title: t("Hủy đơn hoặc hủy buổi"),
      text: t("Tôi muốn hủy một đơn."),
    },
    {
      icon: "map-pin",
      title: t("Thêm địa chỉ mới"),
      text: t("Tôi muốn thêm một địa chỉ mới."),
    },
    {
      icon: "dollar-sign",
      title: t("Xem số dư ví"),
      text: t("Ví CleanWise của tôi còn bao nhiêu?"),
    },
    {
      icon: "credit-card",
      title: t("Kiểm tra thanh toán"),
      text: t("Đơn gần nhất của tôi đã thanh toán chưa?"),
    },
    {
      icon: "book-open",
      title: t("Hướng dẫn đặt dịch vụ"),
      text: t("Hướng dẫn tôi các bước đặt đơn dịch vụ."),
    },
  ];
}

export function ChatbotWelcome({
  onAsk,
  disabled,
}: {
  onAsk: (text: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const [expanded, setExpanded] = useState(false);
  const questions = expanded ? [...getLocalizedQuestions(), ...getLocalizedMoreQuestions()] : getLocalizedQuestions();
  return (
    <View className="px-5 py-6">
      <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
        <View className="w-16 h-16 rounded-3xl bg-primary-light items-center justify-center">
          <MaterialCommunityIcons
            name="robot-happy-outline"
            size={36}
            color={COLORS.primaryDark}
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push("/help" as any)}
          accessibilityRole="button"
          accessibilityLabel={t("Mở hướng dẫn sử dụng")}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full bg-surface border border-line items-center justify-center"
        >
          <Feather name="book-open" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
      <Text className="text-ink text-[23px] font-extrabold">
        {t("Tôi có thể giúp gì cho bạn?")}</Text>
      <Text className="text-ink-soft text-sm leading-6 mt-2 mb-5">
        {t("Tìm dịch vụ, đặt lịch, hủy đơn, xem đơn hàng và ví, hoặc hỏi hướng dẫn có nguồn tham khảo. Với đặt lịch và hủy đơn, tôi luôn hỏi xác nhận trước khi thực hiện.")}</Text>
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
          accessibilityLabel={expanded ? t("Thu gọn gợi ý") : t("Xem thêm gợi ý")}
          accessibilityState={{ expanded }}
          className="flex-row items-center justify-center py-3"
        >
          <Text className="text-primary-dark font-semibold text-sm mr-2">
            {expanded ? t("Thu gọn gợi ý") : t("Xem thêm gợi ý")}
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
