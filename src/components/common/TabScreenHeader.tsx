import { GradientHeader } from "@/components/ui";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode; // phần bên dưới tiêu đề (ô tìm kiếm, avatar...)
};

export function TabScreenHeader({ title, subtitle, children }: Props) {
  return (
    <GradientHeader>
      <View>
        <Text
          className="text-[28px] font-extrabold text-ink"
          style={{ letterSpacing: -0.3 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[13px] text-ink-soft mt-1" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </GradientHeader>
  );
}
