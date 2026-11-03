// components/common/MenuGroup.tsx
import { Children, ReactNode } from "react";
import { Text, View } from "react-native";

export function MenuGroup({
  title,
  children,
  compact = false,
}: {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const items = Children.toArray(children);

  return (
    <View className="mb-6" style={compact ? { marginBottom: 14 } : undefined}>
      {title ? (
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
          {title}
        </Text>
      ) : null}
      <View
        className="bg-surface border border-line overflow-hidden"
        style={{ borderRadius: compact ? 18 : 24 }}
      >
        {items.map((item, i) => (
          <View key={i}>
            {i > 0 && (
              <View
                className="h-px bg-line"
                style={{
                  marginLeft: compact ? 52 : 68,
                  marginRight: compact ? 12 : 16,
                }}
              />
            )}
            {item}
          </View>
        ))}
      </View>
    </View>
  );
}
