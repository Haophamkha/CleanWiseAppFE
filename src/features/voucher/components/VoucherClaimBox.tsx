import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  code: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
};

const NOTCH = 18;

function Notch({ side }: { side: "left" | "right" }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        [side]: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: NOTCH / 2,
        backgroundColor: COLORS.canvas,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.line,
      }}
    />
  );
}

export function VoucherClaimBox({
  code,
  onChange,
  onSubmit,
  loading,
  disabled,
}: Props) {
  const [focused, setFocused] = useState(false);
  const empty = code.trim().length === 0;
  const inactive = disabled || empty;

  return (
    <View
      style={[
        {
          marginBottom: 20,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
          overflow: "hidden",
        },
        SHADOWS.card,
      ]}
    >
      {/* ── Banner ── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18, paddingBottom: 20, overflow: "hidden" }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -34,
            top: -46,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 40,
            bottom: -56,
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              marginRight: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.22)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Feather name="gift" size={22} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: COLORS.white }}
            >
              Bạn có mã ưu đãi?
            </Text>
            <Text
              style={{
                marginTop: 3,
                fontSize: 12.5,
                lineHeight: 17,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Nhập mã để thêm voucher vào ví và dùng ngay khi đặt lịch
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Đường cắt vé ── */}
      <View
        pointerEvents="none"
        style={{
          height: NOTCH,
          marginTop: -NOTCH / 2,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: NOTCH,
        }}
      >
        <View style={{ flex: 1, height: 1, overflow: "hidden" }}>
          <View
            style={{
              height: 2,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: COLORS.line,
            }}
          />
        </View>
        <Notch side="left" />
        <Notch side="right" />
      </View>

      {/* ── Ô nhập mã ── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              height: 50,
              paddingHorizontal: 10,
              marginRight: 8,
              borderRadius: 14,
              borderWidth: 1.5,
              borderStyle: focused ? "solid" : "dashed",
              borderColor: focused ? COLORS.primary : COLORS.primaryBorder,
              backgroundColor: focused ? COLORS.primarySoft : COLORS.canvas,
            }}
          >
            <Feather
              name="tag"
              size={16}
              color={focused ? COLORS.primaryDark : COLORS.inkMuted}
            />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 10,
                paddingVertical: 0,
                fontSize: 15,
                fontWeight: empty ? "500" : "800",
                letterSpacing: empty ? 0 : 1.5,
                color: COLORS.ink,
              }}
              numberOfLines={1}
              placeholder="Nhập mã voucher"
              placeholderTextColor={COLORS.inkMuted}
              value={code}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              editable={!disabled}
            />
            {!empty && !loading && (
              <TouchableOpacity onPress={() => onChange("")} hitSlop={10}>
                <Feather name="x-circle" size={17} color={COLORS.inkMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            disabled={inactive}
            activeOpacity={0.85}
            style={{
              height: 50,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              opacity: inactive ? 0.4 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, fontWeight: "800", color: COLORS.white }}
              >
                Nhận mã
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
