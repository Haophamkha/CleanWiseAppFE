// src/components/service/RepeatableCategoryGroupField.tsx
import type { FormField } from "@/types/Service";
import { formatVnd } from "@/utils/currency";
import { getItemTotalPrice, getUnitPriceForItem } from "@/utils/servicePricing";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
    COLORS,
    FieldControl,
    TabBar,
    Values,
    resolveOptions,
} from "./formFieldShared";

type Props = {
  field: FormField;
  value: Values[];
  pricingConfig?: any;
  onChange: (items: Values[]) => void;
};

export function RepeatableCategoryGroupField({
  field,
  value,
  pricingConfig,
  onChange,
}: Props) {
  const items = Array.isArray(value) ? value : [];
  const itemFields = field.item_fields ?? [];

  const categoryField = itemFields[0];
  const categoryOptions = (categoryField?.options as any[]) ?? [];

  const optionField = itemFields.find(
    (f) => f.key !== categoryField?.key && f.options_by === categoryField?.key,
  );

  const quantityField = itemFields.find((f) => f.type === "QUANTITY");

  const innerFields = itemFields.filter(
    (f) =>
      f.key !== categoryField?.key &&
      f.key !== optionField?.key &&
      f.type !== "QUANTITY",
  );

  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    categoryOptions[0]?.value,
  );

  const selectedCategoryOption = categoryOptions.find(
    (o) => o.value === activeCategory,
  );

  const findItemIndex = (optionValue: string) =>
    items.findIndex(
      (it) =>
        it[categoryField?.key ?? ""] === activeCategory &&
        it[optionField?.key ?? ""] === optionValue,
    );

  const handleSelectOption = (optionValue: string) => {
    const newItem: Values = {
      [categoryField.key]: activeCategory,
      [optionField!.key]: optionValue,
      quantity: quantityField?.min ?? 1,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveByOption = (optionValue: string) => {
    const idx = findItemIndex(optionValue);
    if (idx === -1) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItemAt = (index: number, key: string, v: any) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: v };
    onChange(next);
  };

  const optionList = optionField
    ? resolveOptions(optionField, { [categoryField.key]: activeCategory })
    : [];

  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#FAFAFA",
      }}
    >
      {!!categoryField && (
        <TabBar
          options={categoryOptions}
          value={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      {!!selectedCategoryOption?.image && (
        <View
          style={{
            width: "100%",
            aspectRatio: 1.6,
            backgroundColor: COLORS.background,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <Image
            source={{ uri: selectedCategoryOption.image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      )}

      {optionList.map((opt) => {
        const itemIndex = findItemIndex(opt.value);
        const selected = itemIndex !== -1;
        const item = selected ? items[itemIndex] : undefined;

        const unitPrice = getUnitPriceForItem(
          pricingConfig,
          itemFields,
          item ?? {
            [categoryField.key]: activeCategory,
            [optionField!.key]: opt.value,
          },
        );

        if (!selected) {
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelectOption(opt.value)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4 mb-3"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.white,
              }}
            >
              <Text
                className="text-[15px] font-bold"
                style={{ color: COLORS.text }}
              >
                {opt.label}
              </Text>
              <View className="flex-row items-center">
                {unitPrice != null && (
                  <Text
                    className="text-[13px] font-bold mr-2"
                    style={{ color: COLORS.primary }}
                  >
                    {formatVnd(unitPrice)}
                  </Text>
                )}
                <Feather
                  name="chevron-down"
                  size={18}
                  color={COLORS.textMuted}
                />
              </View>
            </TouchableOpacity>
          );
        }

        const subtotal = getItemTotalPrice(pricingConfig, itemFields, item!);

        return (
          <View
            key={opt.value}
            className="rounded-2xl px-4 py-4 mb-3"
            style={{
              borderWidth: 2,
              borderColor: COLORS.primary,
              backgroundColor: COLORS.primaryLight,
            }}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 pr-2">
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {opt.label}
                </Text>

                {/* Thêm mô tả nếu có (như Ảnh 2) */}
                {!!opt.description && (
                  <Text className="text-[13px] mt-0.5 text-gray-600">
                    {opt.description}
                  </Text>
                )}

                {unitPrice != null && (
                  <Text
                    className="text-[12px] mt-0.5"
                    style={{ color: COLORS.textMuted }}
                  >
                    Đơn giá {formatVnd(unitPrice)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => handleRemoveByOption(opt.value)}
                  className="mr-3"
                >
                  <Feather name="trash-2" size={16} color={COLORS.danger} />
                </TouchableOpacity>
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Feather name="check" size={14} color="#fff" />
                </View>
              </View>
            </View>

            {/* 👉 THÊM ĐOẠN NÀY ĐỂ RENDER ẢNH MINH HỌA TRONG BOX KHI ĐƯỢC CHỌN */}
            {!!opt.image && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1.3,
                  backgroundColor: COLORS.background,
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <Image
                  source={{ uri: opt.image }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Phần số lượng và innerFields giữ nguyên bên dưới */}
            {!!quantityField && (
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-[12px] font-bold uppercase"
                    style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
                  >
                    Số lượng
                  </Text>
                  {subtotal != null && (
                    <Text
                      className="text-[15px] font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {formatVnd(subtotal)}
                    </Text>
                  )}
                </View>
                <FieldControl
                  field={quantityField}
                  value={item?.quantity}
                  siblingValues={item ?? {}}
                  onChange={(v) => updateItemAt(itemIndex, "quantity", v)}
                />
              </View>
            )}

            {innerFields.map((sub) => (
              <View key={sub.key} className="mb-1">
                {sub.type !== "BOOLEAN" && (
                  <Text
                    className="text-[12px] font-bold uppercase mb-2"
                    style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
                  >
                    {sub.label}
                  </Text>
                )}
                <FieldControl
                  field={sub}
                  value={item?.[sub.key]}
                  siblingValues={item ?? {}}
                  pricingConfig={pricingConfig}
                  onChange={(v) => updateItemAt(itemIndex, sub.key, v)}
                />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
