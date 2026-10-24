import { useTranslation } from "react-i18next";

// components/address/AddressForm.tsx
import { Input } from "@/components/ui";
import type { ReactNode } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
export type AddressFormValues = {
  label: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
};

type Props = {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
  canToggle: boolean;
  showContact: boolean;
  isOther: boolean;
  onToggleOther: (on: boolean) => void;
};

const LABEL_PRESETS = ["Nhà", "Công ty", "Khác"];

export function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3 ml-1">
      {children}
    </Text>
  );
}

export default function AddressForm({
  values,
  onChange,
  canToggle,
  showContact,
  isOther,
  onToggleOther,
}: Props) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-sm font-medium text-ink mb-2">{t("Nhãn địa chỉ")}</Text>
      <View className="flex-row mb-3" style={{ gap: 8 }}>
        {LABEL_PRESETS.map((preset) => {
          const active = values.label === preset;
          return (
            <TouchableOpacity
              key={preset}
              activeOpacity={0.8}
              onPress={() => onChange("label", active ? "" : preset)}
              className={`px-4 py-2 rounded-full border ${
                active ? "bg-primary-fill border-primary" : "bg-canvas border-line"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? "text-white" : "text-ink-soft"
                }`}
              >
                {t(preset)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Input
        icon="tag"
        placeholder={t("Hoặc tự đặt tên, vd: Nhà bố mẹ")}
        value={values.label}
        onChangeText={(v) => onChange("label", v)}
      />

      {canToggle && (
        <View className="flex-row items-center justify-between rounded-xl bg-canvas px-4 py-3 mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-medium text-ink">
              {t("Người khác sẽ nhận nhân viên")}</Text>
            <Text className="text-xs text-ink-muted mt-0.5">
              {t("Bật nếu bạn không có mặt tại địa chỉ.")}</Text>
          </View>
          <Switch value={isOther} onValueChange={onToggleOther} />
        </View>
      )}

      {showContact && (
        <>
          <Input
            label={t("Tên liên hệ")}
            icon="user"
            placeholder={t("Nhập tên người liên hệ")}
            autoCapitalize="words"
            value={values.receiver_name}
            onChangeText={(v) => onChange("receiver_name", v)}
          />
          <Input
            label={t("Số điện thoại liên hệ")}
            icon="phone"
            placeholder={t("Nhân viên sẽ gọi số này khi đến nơi")}
            keyboardType="phone-pad"
            value={values.receiver_phone}
            onChangeText={(v) => onChange("receiver_phone", v)}
          />
        </>
      )}
      <Input
        label={t("Địa chỉ cụ thể")}
        icon="home"
        placeholder={t("Số nhà, tên đường")}
        value={values.address_line}
        onChangeText={(v) => onChange("address_line", v)}
      />
    </View>
  );
}
