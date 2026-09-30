import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Image, View } from "react-native";

export function Avatar({
  uri,
  size = 40,
}: {
  uri?: string | null;
  size?: number;
}) {
  return (
    <View
      className="bg-canvas border border-line items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Feather
          name="user"
          size={Math.round(size * 0.45)}
          color={COLORS.inkMuted}
        />
      )}
    </View>
  );
}
