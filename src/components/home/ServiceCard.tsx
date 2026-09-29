import { Card } from "@/components/ui";
import { getServiceGridVisual } from "@/utils/serviceVisuals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  code: string;
  sectionCode: string;
  name: string;
  description?: string;
  onPress: () => void;
};

export function ServiceCard({
  code,
  sectionCode,
  name,
  description,
  onPress,
}: Props) {
  const visual = getServiceGridVisual(code, sectionCode);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: "48%" }}
      className="mb-4"
    >
      <Card style={{ minHeight: 140 }}>
        <View
          className="w-12 h-12 rounded-lg items-center justify-center mb-3"
          style={{ backgroundColor: visual.bg }}
        >
          <MaterialCommunityIcons
            name={visual.icon as any}
            size={26}
            color={visual.color}
          />
        </View>
        <Text className="text-base font-semibold text-ink" numberOfLines={2}>
          {name}
        </Text>
        {description ? (
          <Text className="text-xs text-ink-muted mt-1" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}
