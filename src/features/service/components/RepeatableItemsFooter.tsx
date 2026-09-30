// src/components/service/RepeatableItemsFooter.tsx
import { Button } from "@/components/ui/Button";
import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import type { FormField } from "@/features/service/types/Service";
import { getItemTotalPrice } from "@/features/service/utils/servicePricing";
import { useAppSelector } from "@/store/hooks";
import { formatVnd } from "@/utils/currency";
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
import { getSelectedOption } from "./formFieldShared";

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

  const hasItems = items.length > 0;

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
            backgroundColor: OVERLAY,
          }}
        />
      )}

      {/* Footer */}
      <View
        className="bg-surface border-t border-line"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          borderTopLeftRadius: hasItems ? RADIUS.sheet - 8 : 0,
          borderTopRightRadius: hasItems ? RADIUS.sheet - 8 : 0,
          shadowColor: COLORS.ink,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -6 },
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Header thu gọn / mở rộng */}
        {hasItems && (
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
            className="px-5 pt-2.5 pb-3"
          >
            <View className="items-center mb-2.5">
              <View className="w-10 h-1 rounded-full bg-line" />
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-primary-light items-center justify-center mr-3">
                <Feather
                  name="shopping-bag"
                  size={18}
                  color={COLORS.primaryDark}
                />
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-ink">
                  Thiết bị đã chọn
                </Text>
                <Text className="text-xs text-ink-muted mt-0.5">
                  {expanded ? "Chạm để thu gọn" : "Chạm để xem chi tiết"}
                </Text>
              </View>

              <View className="min-w-[26px] h-[26px] px-2 rounded-full bg-primary items-center justify-center mr-2">
                <Text className="text-white text-[12px] font-bold">
                  {totalQuantity}
                </Text>
              </View>

              <View className="w-8 h-8 rounded-full bg-canvas items-center justify-center">
                <Feather
                  name={expanded ? "chevron-down" : "chevron-up"}
                  size={18}
                  color={COLORS.inkSoft}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Danh sách */}
        {expanded && (
          <ScrollView
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
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
                  className="flex-row items-center rounded-2xl bg-canvas border border-line p-3 mb-2.5"
                >
                  <View className="min-w-[44px] h-11 px-2 rounded-xl bg-primary-light items-center justify-center mr-3">
                    <Text className="text-[14px] font-extrabold text-primary-dark">
                      x{item.quantity ?? 1}
                    </Text>
                  </View>

                  <View className="flex-1 mr-2">
                    <Text
                      className="font-bold text-[15px] text-ink"
                      numberOfLines={1}
                    >
                      {catOpt?.label}
                    </Text>
                    {!!opt && (
                      <Text
                        className="text-[12px] text-ink-muted mt-0.5"
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    )}
                    {itemPrice != null && (
                      <Text className="text-[13px] font-bold text-primary mt-1">
                        {formatVnd(itemPrice)}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => onRemove(index)}
                    hitSlop={8}
                    activeOpacity={0.7}
                    className="w-9 h-9 rounded-full bg-danger-light items-center justify-center"
                  >
                    <Feather name="trash-2" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Tổng tiền + nút */}
        <View
          className={`px-5 pt-3 ${hasItems ? "border-t border-line" : ""}`}
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-ink-soft text-sm">Tổng tiền</Text>
            <Text
              className={`font-extrabold ${
                hasItems ? "text-primary text-xl" : "text-ink-muted text-sm"
              }`}
            >
              {hasItems ? formatVnd(totalPrice) : "Chưa đủ thông tin"}
            </Text>
          </View>

          <Button
            title={displayedSubmitLabel}
            onPress={onSubmit}
            disabled={submitDisabled}
            className="w-full py-4"
          />
        </View>
      </View>
    </>
  );
}
