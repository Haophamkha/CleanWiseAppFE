import ScreenContainer from "@/components/ScreenContainer";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ReactNode } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export function AuthCard({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[420px] self-center">
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-surface border border-line items-center justify-center mb-4"
            >
              <Feather name="arrow-left" size={18} color={COLORS.ink} />
            </TouchableOpacity>
          )}

          <View className="bg-surface rounded-xl border border-line p-8">
            <View className="flex-row items-center mb-8">
              <View className="w-9 h-9 rounded-full bg-primary-light items-center justify-center mr-3">
                <Feather name="droplet" size={16} color={COLORS.primary} />
              </View>
              <Text className="text-base font-semibold text-ink">
                CleanWise
              </Text>
            </View>
            {children}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <View className="mb-8">
      <Text className="text-2xl font-semibold text-ink mb-2">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-ink-soft">{subtitle}</Text>
      ) : null}
    </View>
  );
}
