import { COLORS, GRADIENTS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  balance: number;
  isInitialLoading: boolean;
  isBackgroundFetching: boolean;
  /** Không truyền = ẩn nút "Rút tiền" */
  onWithdraw?: () => void;
};

function Action({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flex: 1, alignItems: "center" }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.primaryLight,
        }}
      >
        <Feather name={icon} size={22} color={COLORS.primaryDark} />
      </View>
      <Text
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: "600",
          color: COLORS.ink,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function WalletHero({
  balance,
  isInitialLoading,
  isBackgroundFetching,
  onWithdraw,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 72,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.surface,
              marginRight: 12,
            }}
          >
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.ink }}>
            Ví của tôi
          </Text>
          {isBackgroundFetching && (
            <ActivityIndicator
              color={COLORS.primary}
              size="small"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </LinearGradient>

      <View
        style={[
          {
            marginTop: -48,
            marginHorizontal: 16,
            padding: 20,
            borderRadius: 24,
            backgroundColor: COLORS.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS.line,
          },
          SHADOWS.card,
        ]}
      >
        <Text style={{ fontSize: 14, color: COLORS.inkSoft }}>
          Số dư khả dụng
        </Text>

        {/* Giữ chỗ chiều cao khi tải lần đầu, tránh "0 đ" nhấp nháy dưới lớp blur */}
        {isInitialLoading ? (
          <View style={{ height: 50 }} />
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontSize: 38,
                lineHeight: 46,
                fontWeight: "800",
                color: COLORS.primaryDark,
              }}
            >
              {balance.toLocaleString("vi-VN")}
            </Text>
            <Text
              style={{
                marginLeft: 4,
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.primaryDark,
              }}
            >
              đ
            </Text>
          </View>
        )}

        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: COLORS.line,
            marginVertical: 16,
          }}
        />

        <View style={{ flexDirection: "row" }}>
          {onWithdraw && (
            <Action
              icon="arrow-down-left"
              label="Rút tiền"
              onPress={onWithdraw}
            />
          )}
          <Action
            icon="plus"
            label="Nạp tiền"
            onPress={() =>
              Alert.alert(
                "Sắp ra mắt",
                "Tính năng nạp tiền vào ví sẽ sớm được cập nhật.",
              )
            }
          />
          <Action
            icon="credit-card"
            label="Ngân hàng"
            onPress={() => router.push("/profile/payment-methods" as any)}
          />
        </View>
      </View>
    </View>
  );
}
