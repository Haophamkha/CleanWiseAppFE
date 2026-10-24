import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import {
    AmountField,
    ErrorBox,
    QuickAmounts,
    SheetButton,
    WalletSheet,
} from "@/features/wallet/components/WalletSheet";
import {
    TOPUP_MAX,
    TOPUP_MIN,
    useTopup,
} from "@/features/wallet/hooks/useWallet";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

type Props = { visible: boolean; onClose: () => void };

export function TopupModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const topup = useTopup(onClose);

  /* ---------- đã tạo lệnh ---------- */
  if (topup.submitted) {
    const waiting = !topup.finished;
    const success = topup.status === "SUCCESS";
    return (
      <WalletSheet visible={visible} onClose={topup.close}>
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          {waiting ? (
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
            {waiting
              ? t("Đang chờ thanh toán")
              : success
                ? t("Nạp tiền thành công")
                : t("Liên kết đã hết hạn hoặc bị hủy")}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.primaryDark,
            }}
          >
            {formatVnd(topup.amountValue)}
          </Text>
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
            {waiting
              ? t("Hoàn tất chuyển khoản ở trang thanh toán. Sau khi thanh toán, quay lại app, số dư sẽ tự cập nhậtopup.")
              : success
                ? t("Số dư ví đã được cộng.")
                : t("Nếu bạn đã chuyển tiền, số dư sẽ được cộng khi hệ thống nhận được xác nhận. Nếu chưa, hãy tạo lệnh nạp mới.")}
          </Text>
        </View>

        {waiting && !!topup.checkoutUrl && (
          <SheetButton label={t("Mở trang thanh toán")} onPress={topup.openCheckout} />
        )}
        {waiting && topup.mockPay && (
          <SheetButton
            label={t("[DEV] Giả lập đã thanh toán")}
            onPress={topup.mockPay}
            loading={topup.mockLoading}
            variant="soft"
          />
        )}
        <ErrorBox text={topup.errorText} />
        <SheetButton
          label={waiting ? t("Đóng, kiểm tra sau") : t("Đóng")}
          onPress={topup.close}
          variant="soft"
        />
      </WalletSheet>
    );
  }

  /* ---------- form ---------- */
  return (
    <WalletSheet visible={visible} onClose={topup.close}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}>
        {t("Nạp tiền vào ví")}</Text>
      <Text
        style={{
          fontSize: 13,
          marginTop: 4,
          marginBottom: 20,
          color: COLORS.inkMuted,
        }}
      >
        {t("Tối thiểu")}{" "}{formatVnd(TOPUP_MIN)}{t(", tối đa")} {formatVnd(TOPUP_MAX)}{t("/lần. Bạn sẽ được chuyển sang trang thanh toán để chuyển khoản.")}</Text>

      <AmountField
        value={topup.amountText}
        onChange={topup.setAmountText}
        editable={!topup.uncertain}
      />
      <QuickAmounts
        amounts={topup.quickAmounts}
        onPick={(v) => topup.setAmountText(String(v))}
        format={formatVnd}
        disabled={topup.uncertain}
      />

      <ErrorBox text={topup.errorText} />

      <SheetButton
        label={topup.uncertain ? t("Thử lại") : t("Tiếp tục thanh toán")}
        onPress={topup.submit}
        loading={topup.isLoading}
      />
    </WalletSheet>
  );
}
