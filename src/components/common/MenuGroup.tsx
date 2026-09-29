// components/common/MenuGroup.tsx
import { Children, ReactNode } from "react";
import { Text, View } from "react-native";

// Nhóm các MenuListItem trong một khung, tự chèn đường kẻ giữa các mục
export function MenuGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);

  return (
    <View className="mb-5">
      {title ? (
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
          {title}
        </Text>
      ) : null}
      <View className="bg-surface rounded-xl border border-line overflow-hidden">
        {items.map((item, i) => (
          <View key={i}>
            {i > 0 && (
              <View className="h-px bg-line" style={{ marginLeft: 68 }} />
            )}
            {item}
          </View>
        ))}
      </View>
    </View>
  );
}
