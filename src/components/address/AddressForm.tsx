// components/address/AddressForm.tsx
import { Input } from "@/components/ui";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type AddressFormValues = {
  label: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
};

type Props = {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
};

const LABEL_PRESETS = ["Nhà", "Công ty", "Khác"];

export function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3 ml-1">
      {children}
    </Text>
  );
}

export default function AddressForm({ values, onChange }: Props) {
  return (
    <View>
      <Text className="text-sm font-medium text-ink mb-2">Nhãn địa chỉ</Text>
      <View className="flex-row mb-3" style={{ gap: 8 }}>
        {LABEL_PRESETS.map((preset) => {
          const active = values.label === preset;
          return (
            <TouchableOpacity
              key={preset}
              activeOpacity={0.8}
              onPress={() => onChange("label", active ? "" : preset)}
              className={`px-4 py-2 rounded-full border ${
                active ? "bg-primary border-primary" : "bg-canvas border-line"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? "text-white" : "text-ink-soft"
                }`}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Input
        icon="tag"
        placeholder="Hoặc tự đặt tên, vd: Nhà bố mẹ"
        value={values.label}
        onChangeText={(v) => onChange("label", v)}
      />

      <Input
        label="Tên người nhận"
        icon="user"
        placeholder="Nhập tên người nhận"
        autoCapitalize="words"
        value={values.receiver_name}
        onChangeText={(v) => onChange("receiver_name", v)}
      />
      <Input
        label="Số điện thoại"
        icon="phone"
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
        value={values.receiver_phone}
        onChangeText={(v) => onChange("receiver_phone", v)}
      />
      <Input
        label="Địa chỉ cụ thể"
        icon="home"
        placeholder="Số nhà, tên đường"
        value={values.address_line}
        onChangeText={(v) => onChange("address_line", v)}
      />
    </View>
  );
}
