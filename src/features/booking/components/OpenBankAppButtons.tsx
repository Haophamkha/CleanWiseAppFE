import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

export type BankTransferInfo = {
  bank_bin?: string;
  account_number?: string;
  account_name?: string;
  transfer_content?: string;
  amount?: number;
};

// Lấy từ api.vietqr.io/v2/android-app-deeplinks.
// autofill = app tự điền sẵn số tài khoản / số tiền / nội dung.
const BANK_APPS = [
  { appId: "mb", name: "MB Bank", autofill: true },
  { appId: "bidv", name: "BIDV SmartBanking", autofill: true },
  { appId: "icb", name: "VietinBank iPay", autofill: true },
  { appId: "acb", name: "ACB One", autofill: true },
  { appId: "ocb", name: "OCB OMNI", autofill: true },
  { appId: "vcb", name: "Vietcombank", autofill: false },
  { appId: "tcb", name: "Techcombank", autofill: false },
  { appId: "vpb", name: "VPBank NEO", autofill: false },
  { appId: "tpb", name: "TPBank Mobile", autofill: false },
  { appId: "vba", name: "Agribank", autofill: false },
];

// Dự phòng khi không gọi được api.vietqr.io/v2/banks: BIN -> mã ngân hàng nhận tiền.
const FALLBACK_BANK_CODE_BY_BIN: Record<string, string> = {
  "970422": "mb",
  "970436": "vcb",
  "970415": "icb",
  "970418": "bidv",
  "970407": "tcb",
  "970432": "vpb",
  "970416": "acb",
  "970448": "ocb",
  "970423": "tpb",
  "970405": "vba",
};

const q = (v: string | number) => encodeURIComponent(String(v));

export function OpenBankAppButtons({ info }: { info: BankTransferInfo }) {
  const [receiverCode, setReceiverCode] = useState<string | null>(
    info.bank_bin ? (FALLBACK_BANK_CODE_BY_BIN[info.bank_bin] ?? null) : null,
  );

  useEffect(() => {
    if (!info.bank_bin) return;
    let cancelled = false;
    fetch("https://api.vietqr.io/v2/banks")
      .then((r) => r.json())
      .then((d) => {
        const bank = (d?.data ?? []).find((b: any) => b.bin === info.bank_bin);
        if (!cancelled && bank?.code)
          setReceiverCode(String(bank.code).toLowerCase());
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [info.bank_bin]);

  if (!info.account_number || !info.amount) return null;

  const open = async (appId: string) => {
    console.log("[BANKAPP] info =", JSON.stringify(info));
    console.log("[BANKAPP] appId =", appId, "| receiverCode =", receiverCode);

    if (!receiverCode) {
      Alert.alert(
        "Chưa mở được",
        "Hãy bấm “Mở trang thanh toán” hoặc quét mã QR.",
      );
      return;
    }

    const url =
      `https://dl.vietqr.io/pay?app=${q(appId)}` +
      `&ba=${info.account_number}@${receiverCode}` + // bỏ q(), để nguyên dấu @
      `&am=${q(info.amount!)}` +
      `&tn=${q(info.transfer_content ?? "")}` +
      `&bn=${q(info.account_name ?? "")}`;

    console.log("[BANKAPP] url =", url);

    try {
      await Linking.openURL(url);
      console.log("[BANKAPP] openURL OK");
    } catch (e) {
      console.log("[BANKAPP] openURL FAIL", e);
      Alert.alert(
        "Không mở được ứng dụng",
        "Hãy bấm “Mở trang thanh toán” hoặc quét mã QR.",
      );
    }
  };

  return (
    <View className="w-full mt-5">
      <Text className="font-bold text-[14px] text-ink mb-2">
        Hoặc mở thẳng app ngân hàng
      </Text>

      {BANK_APPS.map((b) => (
        <TouchableOpacity
          key={b.appId}
          onPress={() => open(b.appId)}
          activeOpacity={0.85}
          className="flex-row items-center rounded-2xl border border-line bg-surface px-4 py-3 mb-2"
        >
          <Text className="flex-1 font-semibold text-[14px] text-ink">
            {b.name}
          </Text>
          {b.autofill && (
            <View className="px-2 py-0.5 rounded-full bg-primary-light mr-2">
              <Text className="text-[10px] font-bold text-primary-dark">
                Tự điền sẵn
              </Text>
            </View>
          )}
          <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
        </TouchableOpacity>
      ))}

      <View className="rounded-2xl bg-canvas border border-line px-4 py-3 mt-1">
        <Text className="text-[11px] text-ink-muted mb-2">
          Nếu app không tự điền, nhập đúng thông tin sau:
        </Text>
        <Text className="text-[12px] text-ink-soft">Số tài khoản</Text>
        <Text selectable className="text-[14px] font-bold text-ink mb-1.5">
          {info.account_number}
        </Text>
        <Text className="text-[12px] text-ink-soft">Số tiền</Text>
        <Text selectable className="text-[14px] font-bold text-ink mb-1.5">
          {info.amount.toLocaleString("vi-VN")}đ
        </Text>
        <Text className="text-[12px] text-ink-soft">Nội dung chuyển khoản</Text>
        <Text selectable className="text-[14px] font-bold text-ink">
          {info.transfer_content}
        </Text>
      </View>
    </View>
  );
}
