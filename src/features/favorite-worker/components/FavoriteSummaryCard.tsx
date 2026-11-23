import { useTranslation } from "react-i18next";

import { ON_DARK } from "@/constants/theme";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

export function FavoriteSummaryCard({ count }: { count: number }) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  return (
    <View style={[{ marginBottom: 16, borderRadius: 24, backgroundColor: COLORS.accent }, SHADOWS.card]}>
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <View pointerEvents="none" style={{ position: "absolute", right: -14, bottom: -22 }}>
          <Feather name="heart" size={120} color={ON_DARK.surface} />
        </View>
        <View pointerEvents="none" style={{ position: "absolute", right: -30, top: -40, width: 110, height: 110, borderRadius: 55, backgroundColor: ON_DARK.surface }} />

        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ON_DARK.surface,
            borderWidth: 1,
            borderColor: ON_DARK.border,
          }}
        >
          <Text style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: ON_DARK.text }}>
            {count}
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: ON_DARK.text }}>
            {t("Nh\u00e2n vi\u00ean y\u00eau th\u00edch")}
          </Text>
          <Text style={{ marginTop: 3, fontSize: 13, color: ON_DARK.textSoft }}>
            {t("\u0110\u00e3 l\u01b0u trong danh s\u00e1ch c\u1ee7a b\u1ea1n")}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}