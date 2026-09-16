// src/components/service/ServiceGridItem.tsx
import { getServiceGridVisual } from "@/utils/serviceVisuals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  code: string;
  sectionCode: string;
  name: string;
  onPress: () => void;
};

export function ServiceGridItem({ code, sectionCode, name, onPress }: Props) {
  const visual = getServiceGridVisual(code, sectionCode);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ width: "25%" }}
      className="items-center px-1 mb-6"
    >
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: visual.bg }}
      >
        <MaterialCommunityIcons
          name={visual.icon as any}
          size={28}
          color={visual.color}
        />
      </View>
      <Text
        className="text-gray-700 text-xs text-center font-medium"
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
