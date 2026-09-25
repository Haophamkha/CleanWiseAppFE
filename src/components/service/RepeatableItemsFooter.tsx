// src/components/service/RepeatableItemsFooter.tsx
import { useAppSelector } from "@/store/hooks";
import type { FormField } from "@/types/Service";
import { formatVnd } from "@/utils/currency";
import { getItemTotalPrice } from "@/utils/servicePricing";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, getSelectedOption } from "./formFieldShared";

type Values = Record<string, any>;

type Props = {
  groupField: FormField;
  items: Values[];
  pricingConfig?: any;
  onRemove: (index: number) => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
};

export function RepeatableItemsFooter({
  groupField,
  items,
  pricingConfig,
  onRemove,
  onSubmit,
  submitDisabled,
  submitLabel = "Tiếp theo",
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const displayedSubmitLabel = isAuthenticated ? submitLabel : "Đăng nhập ngay";
  const insets = useSafeAreaInsets();

  const itemFields = groupField.item_fields ?? [];
  const categoryField = itemFields[0];
  const categoryOptions = (categoryField?.options as any[]) ?? [];
  const optionField = itemFields.find(
    (f) => f.key !== categoryField?.key && f.options_by === categoryField?.key,
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + (getItemTotalPrice(pricingConfig, itemFields, item) ?? 0),
    0,
  );
  const totalQuantity = items.reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );

  return (
    <>
      {/* Nền mờ khi mở rộng */}
      {expanded && (
        <Pressable
          onPress={() => setExpanded(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(17,24,39,0.45)",
          }}
        />
      )}

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: items.length > 0 ? 24 : 0,
          borderTopRightRadius: items.length > 0 ? 24 : 0,
          borderTopWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {/* Header */}
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
            className="flex-row items-center px-5 pt-4 pb-3"
          >
            <Text
              className="flex-1 text-[16px] font-bold"
              style={{ color: COLORS.text }}
            >
              Thiết bị đã chọn
            </Text>

            <View
              className="w-6 h-6 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: COLORS.danger }}
            >
              <Text className="text-white text-[12px] font-bold">
                {totalQuantity}
              </Text>
            </View>

            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {/* List */}
        {expanded && (
          <ScrollView
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, index) => {
              const catOpt = categoryOptions.find(
                (o) => o.value === item[categoryField?.key ?? ""],
              );

              const opt = optionField
                ? getSelectedOption(optionField, item)
                : undefined;

              const itemPrice = getItemTotalPrice(
                pricingConfig,
                itemFields,
                item,
              );

              return (
                <View
                  key={index}
                  className="rounded-2xl mb-3 p-4"
                  style={{
                    backgroundColor: COLORS.background,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <Text
                      className="font-bold text-[15px]"
                      style={{ color: COLORS.primary }}
                    >
                      {catOpt?.label}
                    </Text>

                    <TouchableOpacity
                      onPress={() => onRemove(index)}
                      hitSlop={{
                        top: 8,
                        bottom: 8,
                        left: 8,
                        right: 8,
                      }}
                    >
                      <Feather name="trash-2" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  {!!opt && (
                    <Text
                      className="text-[13px] mb-0.5"
                      style={{ color: COLORS.textMuted }}
                    >
                      {opt.label}
                    </Text>
                  )}

                  <View className="flex-row items-center justify-between mt-1">
                    <Text
                      className="text-[13px]"
                      style={{ color: COLORS.textMuted }}
                    >
                      Số lượng: {item.quantity ?? 1}
                    </Text>

                    {itemPrice != null && (
                      <Text
                        className="text-[14px] font-bold"
                        style={{ color: COLORS.text }}
                      >
                        {formatVnd(itemPrice)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Bottom */}
        <View
          className="px-6 pt-4 border-t border-gray-100"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">Tổng tiền</Text>

            <Text className="text-emerald-700 font-bold text-lg">
              {items.length > 0 ? formatVnd(totalPrice) : "Chưa đủ thông tin"}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            style={{ opacity: submitDisabled ? 0.6 : 1 }}
            activeOpacity={0.8}
            onPress={onSubmit}
            disabled={submitDisabled}
          >
            <Text className="text-white font-bold text-base">
              {displayedSubmitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
