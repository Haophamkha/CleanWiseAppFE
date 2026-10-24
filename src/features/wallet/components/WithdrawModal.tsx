import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { OtpInput } from "@/features/auth/components/OtpInput";
import {
  AmountField,
  ErrorBox,
  QuickAmounts,
  SheetButton,
  WalletSheet,
} from "@/features/wallet/components/WalletSheet";
import {
  WITHDRAW_MAX,
  WITHDRAW_MIN,
  useWithdraw,
} from "@/features/wallet/hooks/useWallet";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  balance: number;
  onClose: () => void;
};

export function WithdrawModal({ visible, balance, onClose }: Props) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const w = useWithdraw(balance, onClose);

  /* ---------- kết quả ---------- */
  if (w.submitted) {
    const processing = w.status === "PROCESSING";
    const success = w.status === "SUCCESS";
    return (
      <WalletSheet visible={visible} onClose={w.close}>
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          {processing ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: success
                  ? COLORS.successLight
                  : COLORS.dangerLight,
              }}
            >
              <Feather
                name={success ? "check" : "x"}
                size={30}
                color={success ? COLORS.success : COLORS.danger}
              />
            </View>
          )}
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.ink,
            }}
          >
            {processing
              ? t("Đang xử lý yêu cầu rút")
              : success
                ? t("Rút tiền thành công")
                : t("Rút tiền thất bại")}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.primaryDark,
            }}
          >
            {formatVnd(w.submittedAmount)}
          </Text>
          {!!w.record && (
            <Text
              style={{ marginTop: 6, fontSize: 13, color: COLORS.inkMuted }}
            >
              {w.record.bank_name} {w.record.account_number_masked}
            </Text>
          )}
          <Text
            style={{
              marginTop: 12,
              marginBottom: 20,
              fontSize: 13,
              lineHeight: 19,
              textAlign: "center",
              color: COLORS.inkSoft,
            }}
          >
            {processing
              ? t("Tiền sẽ về tài khoản trong ít phút. Bạn có thể đóng cửa sổ này, trạng thái sẽ cập nhật trong lịch sử giao dịch.")
              : success
                ? t("Tiền đã được chuyển về tài khoản ngân hàng của bạn.")
                : w.record?.failure_reason ||
                  t("Giao dịch không thành công. Tiền đã được hoàn vào ví.")}
          </Text>
        </View>
        <SheetButton label={t("Đóng")} onPress={w.close} variant="soft" />
      </WalletSheet>
    );
  }

  /* ---------- nhập OTP ---------- */
  if (w.otpStep) {
    return (
      <WalletSheet visible={visible} onClose={w.close}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}>
          {t("Nhập mã OTP")}</Text>
        <Text
          style={{
            fontSize: 13,
            marginTop: 4,
            marginBottom: 16,
            color: COLORS.inkMuted,
          }}
        >
          {t("Mã gồm 6 số đã gửi tới email của bạn để xác nhận rút")}{" "}
          {formatVnd(w.submittedAmount)}.
        </Text>

        <OtpInput value={w.otp} onChange={w.setOtp} invalid={!!w.errorText} />
        <ErrorBox text={w.errorText} />

        <TouchableOpacity
          onPress={w.resendOtp}
          disabled={w.cooldown > 0 || w.sendingOtp}
          style={{ alignSelf: "center", marginBottom: 16 }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: w.cooldown > 0 ? COLORS.inkMuted : COLORS.primaryDark,
            }}
          >
            {w.cooldown > 0 ? t("Gửi lại mã ({{value0}}s)", { value0: w.cooldown }) : t("Gửi lại mã")}
          </Text>
        </TouchableOpacity>

        <SheetButton
          label={w.uncertain ? t("Gửi lại") : t("Xác nhận rút tiền")}
          onPress={w.submit}
          loading={w.isLoading}
        />
        <SheetButton label={t("Quay lại")} onPress={w.backToForm} variant="soft" />
      </WalletSheet>
    );
  }

  /* ---------- form ---------- */
  return (
    <WalletSheet visible={visible} onClose={w.close}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}>
        {t("Rút tiền về tài khoản")}</Text>
      <Text
        style={{
          fontSize: 13,
          marginTop: 4,
          marginBottom: 16,
          color: COLORS.inkMuted,
        }}
      >
        {t("Số dư khả dụng")}{" "}{formatVnd(balance)}  {t("· Tối thiểu")}{" "}
        {formatVnd(WITHDRAW_MIN)}{t(", tối đa")} {formatVnd(WITHDRAW_MAX)}{t("/lần")}</Text>

      {/* tài khoản nhận */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 8,
          color: COLORS.inkSoft,
        }}
      >
        {t("Tài khoản nhận tiền")}</Text>
      {w.methodsLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginBottom: 16 }}
        />
      ) : w.methods.length === 0 ? (
        <TouchableOpacity
          onPress={() => {
            w.close();
            router.push("/profile/payment-methods/add" as any);
          }}
          activeOpacity={0.8}
          style={{
            padding: 14,
            marginBottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: COLORS.primaryBorder,
            backgroundColor: COLORS.primarySoft,
          }}
        >
          <Text style={{ fontWeight: "700", color: COLORS.primaryDark }}>
            {t("+ Thêm tài khoản ngân hàng")}</Text>
          <Text style={{ fontSize: 12, marginTop: 2, color: COLORS.inkSoft }}>
            {t("Bạn cần có tài khoản ngân hàng để rút tiền.")}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginBottom: 16, gap: 8 }}>
          {w.methods.map((m) => {
            const active = w.selected?.id === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                disabled={w.uncertain}
                onPress={() => w.selectMethod(m.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: active ? COLORS.primary : COLORS.line,
                  backgroundColor: active ? COLORS.primarySoft : COLORS.surface,
                  opacity: w.uncertain && !active ? 0.5 : 1,
                }}
              >
                <Feather
                  name="credit-card"
                  size={18}
                  color={COLORS.primaryDark}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontWeight: "700", color: COLORS.ink }}>
                    {m.bank_name} {m.account_number_masked}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: COLORS.inkMuted }}
                    numberOfLines={1}
                  >
                    {m.account_holder_name}
                    {m.is_default ? t(" · Mặc định") : ""}
                  </Text>
                </View>
                {active && (
                  <Feather
                    name="check-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <AmountField
        value={w.amountText}
        onChange={w.setAmountText}
        editable={!w.uncertain}
      />
      <QuickAmounts
        amounts={w.quickAmounts}
        onPick={(v) => w.setAmountText(String(v))}
        format={formatVnd}
        disabled={w.uncertain}
      />

      <ErrorBox text={w.errorText} />

      <SheetButton
        label={t("Gửi mã OTP")}
        onPress={w.submit}
        loading={w.sendingOtp}
      />
    </WalletSheet>
  );
}
