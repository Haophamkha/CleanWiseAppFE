// components/common/MenuGroup.tsx
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Children, ReactNode } from "react";
import { Text, View } from "react-native";

// Nhóm các MenuListItem trong một khung, tự chèn đường kẻ giữa các mục
export function MenuGroup({
  title,
  children,
  compact = false,
}: {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const { isDark } = useAppTheme();
  const items = Children.toArray(children);

  return (
    <View className="mb-5" style={compact ? { marginBottom: 14 } : undefined}>
      {title ? (
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
          {title}
        </Text>
      ) : null}
      <View
        className={`bg-surface border border-line overflow-hidden ${isDark ? "rounded-[20px]" : "rounded-xl"}`}
        style={compact ? { borderRadius: 18 } : undefined}
      >
        {items.map((item, i) => (
          <View key={i}>
            {i > 0 && (
              <View className="h-px bg-line" style={{ marginLeft: compact ? 52 : 68, marginRight: compact ? 12 : 0 }} />
            )}
            {item}
          </View>
        ))}
      </View>
    </View>
  );
}
