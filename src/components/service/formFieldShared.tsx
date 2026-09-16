// src/components/service/formFieldShared.tsx
import type {
    ConditionalOptionGroup,
    FieldOption,
    FormField,
    PricingConfig,
} from "@/types/Service";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import {
    Image,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type Values = Record<string, any>;

export const COLORS = {
  primary: "#047857",
  primaryLight: "#ECFDF5",
  primaryBorder: "#A7F3D0",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  background: "#F3F4F6",
  white: "#FFFFFF",
  danger: "#DC2626",
};

export const isConditional = (
  options: FieldOption[] | ConditionalOptionGroup[] | undefined,
): options is ConditionalOptionGroup[] =>
  !!options && options.length > 0 && "when" in options[0];

export function resolveOptions(
  field: FormField,
  siblingValues: Values,
): FieldOption[] {
  if (!field.options) return [];
  if (!isConditional(field.options)) return field.options;
  if (!field.options_by) return [];

  const currentValue = siblingValues[field.options_by];
  const match = field.options.find(
    (group) => group.when[field.options_by!] === currentValue,
  );
  return match?.items ?? [];
}

export function getSelectedOption(
  field: FormField,
  siblingValues: Values,
): FieldOption | undefined {
  const options = resolveOptions(field, siblingValues);
  return options.find((o) => o.value === siblingValues[field.key]);
}

// Chỉ trả về GIÁ, không nối description vào — description đã được
// OptionCard/ImageOptionCard tự hiển thị riêng, nối vào đây sẽ bị lặp chữ.
export function buildCaption(
  opt: FieldOption,
  isAdditive: boolean,
  pricingConfig?: PricingConfig,
): string | undefined {
  const price = isAdditive
    ? pricingConfig?.additional_services?.[opt.value]
    : pricingConfig?.base_prices?.[opt.value];

  if (typeof price !== "number") return undefined;
  return isAdditive ? `+${formatVnd(price)}` : formatVnd(price);
}

// ============================================================
// ATOM: OptionCard — thẻ chọn dạng danh sách dọc, full width
// (dùng cho SINGLE_SELECT không có ảnh: Thời lượng, Quy mô nhà, Công suất...)
// ============================================================
export function OptionCard({
  label,
  description,
  caption,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="rounded-2xl px-4 py-4 mb-3"
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? COLORS.primary : COLORS.border,
        backgroundColor: selected ? COLORS.primaryLight : COLORS.white,
        shadowColor: "#000",
        shadowOpacity: selected ? 0.06 : 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: selected ? 2 : 1,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-[16px] font-bold"
            style={{ color: selected ? COLORS.primary : COLORS.text }}
          >
            {label}
          </Text>
          {!!description && (
            <Text
              className="text-[13px] mt-1"
              style={{ color: COLORS.textMuted }}
            >
              {description}
            </Text>
          )}
        </View>
        {selected ? (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Feather name="check" size={14} color="#fff" />
          </View>
        ) : (
          <View
            className="w-6 h-6 rounded-full"
            style={{ borderWidth: 2, borderColor: COLORS.border }}
          />
        )}
      </View>
      {!!caption && (
        <View
          className="self-start mt-2.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: selected ? "#FFFFFF" : COLORS.background,
          }}
        >
          <Text
            className="text-[13px] font-bold"
            style={{ color: COLORS.primary }}
          >
            {caption}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// ATOM: ImageOptionCard — lưới 2 cột có ảnh minh hoạ
// (dùng cho field có options chứa `image`: Loại nhà, Dịch vụ thêm...)
// ============================================================
export function ImageOptionCard({
  image,
  label,
  description,
  caption,
  selected,
  onPress,
}: {
  image?: string;
  label: string;
  description?: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: "48%" }}
      className="mb-3"
    >
      <View
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? COLORS.primary : COLORS.border,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: COLORS.white,
          shadowColor: "#000",
          shadowOpacity: selected ? 0.08 : 0.04,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 8,
          elevation: selected ? 3 : 1,
        }}
      >
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: COLORS.background,
          }}
        >
          {!!image && (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}
          {selected && (
            <View
              className="absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Feather name="check" size={14} color="#fff" />
            </View>
          )}
        </View>
        <View className="px-3 py-3">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold"
            style={{ color: selected ? COLORS.primary : COLORS.text }}
          >
            {label}
          </Text>
          {!!description && (
            <Text
              numberOfLines={2}
              className="text-[11px] mt-0.5"
              style={{ color: COLORS.textMuted }}
            >
              {description}
            </Text>
          )}
          {!!caption && (
            <View
              className="self-start mt-2 px-2 py-1 rounded-md"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <Text
                className="text-[12px] font-bold"
                style={{ color: COLORS.primary }}
              >
                {caption}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// ATOM: Pill — chip nhỏ (fallback cho MULTI_SELECT không có ảnh)
// ============================================================
export function Pill({
  label,
  caption,
  selected,
  onPress,
}: {
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="px-4 py-2.5 rounded-xl border mr-2 mb-2"
      style={{
        backgroundColor: selected ? COLORS.primary : COLORS.white,
        borderColor: selected ? COLORS.primary : COLORS.border,
        maxWidth: 220,
      }}
    >
      <Text
        className="text-[14px]"
        style={{
          color: selected ? COLORS.white : COLORS.textSecondary,
          fontWeight: selected ? "600" : "500",
        }}
      >
        {label}
      </Text>
      {!!caption && (
        <Text
          className="text-[11px] mt-0.5"
          style={{ color: selected ? "#D1FAE5" : COLORS.textMuted }}
        >
          {caption}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// ATOM: TabBar — thanh tab ngang (dùng cho category chọn trong REPEATABLE_GROUP)
// ============================================================
export function TabBar({
  options,
  value,
  onChange,
}: {
  options: FieldOption[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingRight: 8 }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
            className="px-4 py-2.5 rounded-xl mr-2"
            style={{
              backgroundColor: selected ? COLORS.primary : COLORS.background,
            }}
          >
            <Text
              className="text-[14px] font-bold"
              style={{ color: selected ? "#fff" : COLORS.textSecondary }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================
// ATOM: QuantityStepper
// ============================================================
export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        activeOpacity={0.8}
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <Feather name="minus" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <Text
        className="mx-4 text-[16px] font-bold min-w-[24px] text-center"
        style={{ color: COLORS.text }}
      >
        {value}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        activeOpacity={0.8}
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <Feather name="plus" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// ATOM: BooleanToggleRow
// ============================================================
export function BooleanToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      className="flex-row items-center justify-between rounded-xl px-4 py-3 mb-3"
      style={{
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-[14px] font-medium"
          style={{ color: COLORS.text }}
        >
          {label}
        </Text>
        {!!description && (
          <Text
            className="text-[12px] mt-0.5"
            style={{ color: COLORS.textMuted }}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryBorder }}
        thumbColor={value ? COLORS.primary : "#FFFFFF"}
      />
    </View>
  );
}

// ============================================================
// ATOM: WeekdayRow
// ============================================================
export function WeekdayRow({
  options,
  value,
  onChange,
}: {
  options: FieldOption[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <View className="flex-row justify-between">
      {options.map((opt) => {
        const isSelected = value.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() =>
              onChange(
                isSelected
                  ? value.filter((v) => v !== opt.value)
                  : [...value, opt.value],
              )
            }
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: isSelected ? COLORS.primary : COLORS.background,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: isSelected ? COLORS.white : COLORS.textMuted }}
            >
              {opt.label.replace("Thứ ", "T")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ============================================================
// ATOM: TimeField
// ============================================================
export function TimeField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const [hh, mm] =
    typeof value === "string" && value.includes(":")
      ? value.split(":")
      : ["08", "00"];

  const updateTime = (nextHH: string, nextMM: string) => {
    const h = Math.min(23, Math.max(0, parseInt(nextHH || "0", 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(nextMM || "0", 10) || 0));
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  return (
    <View
      className="flex-row items-center justify-center rounded-xl py-3"
      style={{
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <TextInput
        className="text-[20px] font-bold text-center"
        style={{ color: COLORS.text, minWidth: 48 }}
        keyboardType="number-pad"
        maxLength={2}
        value={hh}
        onChangeText={(t) => updateTime(t, mm)}
      />
      <Text
        className="text-[20px] font-bold mx-2"
        style={{ color: COLORS.textMuted }}
      >
        :
      </Text>
      <TextInput
        className="text-[20px] font-bold text-center"
        style={{ color: COLORS.text, minWidth: 48 }}
        keyboardType="number-pad"
        maxLength={2}
        value={mm}
        onChangeText={(t) => updateTime(hh, t)}
      />
    </View>
  );
}

// ============================================================
// DISPATCHER: FieldControl — chọn đúng atom theo field.type
// Dùng cho mọi field KHÔNG PHẢI REPEATABLE_GROUP
// ============================================================
export function FieldControl({
  field,
  value,
  siblingValues,
  pricingConfig,
  onChange,
}: {
  field: FormField;
  value: any;
  siblingValues: Values;
  pricingConfig?: PricingConfig;
  onChange: (v: any) => void;
}) {
  const options = resolveOptions(field, siblingValues);
  const hasImages = options.some((o) => !!o.image);

  switch (field.type) {
    case "SINGLE_SELECT":
      if (hasImages) {
        return (
          <View className="flex-row flex-wrap justify-between">
            {options.map((opt) => (
              <ImageOptionCard
                key={opt.value}
                image={opt.image}
                label={opt.label}
                description={opt.description}
                caption={buildCaption(opt, false, pricingConfig)}
                selected={value === opt.value}
                onPress={() => onChange(opt.value)}
              />
            ))}
          </View>
        );
      }
      if (field.display === "grid") {
        return (
          <View className="flex-row flex-wrap justify-between">
            {options.map((opt) => (
              <GridOptionCard
                key={opt.value}
                label={opt.label}
                caption={buildCaption(opt, false, pricingConfig)}
                selected={value === opt.value}
                onPress={() => onChange(opt.value)}
              />
            ))}
          </View>
        );
      }
      return (
        <View>
          {options.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              caption={buildCaption(opt, false, pricingConfig)}
              selected={value === opt.value}
              onPress={() => onChange(opt.value)}
            />
          ))}
        </View>
      );
      return (
        <View>
          {options.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              caption={buildCaption(opt, false, pricingConfig)}
              selected={value === opt.value}
              onPress={() => onChange(opt.value)}
            />
          ))}
        </View>
      );

    case "MULTI_SELECT": {
      const selected: string[] = Array.isArray(value) ? value : [];
      if (hasImages) {
        return (
          <View className="flex-row flex-wrap justify-between">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <ImageOptionCard
                  key={opt.value}
                  image={opt.image}
                  label={opt.label}
                  description={opt.description}
                  caption={buildCaption(opt, true, pricingConfig)}
                  selected={isSelected}
                  onPress={() =>
                    onChange(
                      isSelected
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value],
                    )
                  }
                />
              );
            })}
          </View>
        );
      }
      return (
        <View className="flex-row flex-wrap">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <Pill
                key={opt.value}
                label={opt.label}
                caption={buildCaption(opt, true, pricingConfig)}
                selected={isSelected}
                onPress={() =>
                  onChange(
                    isSelected
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value],
                  )
                }
              />
            );
          })}
        </View>
      );
    }

    case "WEEKDAY_MULTI_SELECT":
      return (
        <WeekdayRow
          options={(field.options as FieldOption[]) ?? []}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case "QUANTITY":
      return (
        <QuantityStepper
          value={typeof value === "number" ? value : (field.min ?? 1)}
          min={field.min}
          max={field.max}
          onChange={onChange}
        />
      );

    case "TEXT":
    case "TEXTAREA":
      return (
        <TextInput
          className="rounded-xl px-4 py-3 text-[15px]"
          style={{
            backgroundColor: COLORS.background,
            borderWidth: 1,
            borderColor: COLORS.border,
            color: COLORS.text,
            minHeight: field.type === "TEXTAREA" ? 80 : undefined,
            textAlignVertical: field.type === "TEXTAREA" ? "top" : "center",
          }}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={field.type === "TEXTAREA"}
          numberOfLines={field.type === "TEXTAREA" ? 3 : 1}
          value={value ?? ""}
          onChangeText={onChange}
        />
      );

    case "BOOLEAN":
      return (
        <BooleanToggleRow
          label={field.label}
          description={field.description}
          value={!!value}
          onChange={onChange}
        />
      );

    case "TIME":
      return <TimeField value={value} onChange={onChange} />;

    default:
      return null;
  }
}

// ============================================================
// ATOM: GridOptionCard — thẻ chọn nhỏ gọn, 2 cột
// (dùng cho SINGLE_SELECT có field.display === "grid", VD: Thời hạn gói)
// ============================================================
export function GridOptionCard({
  label,
  caption,
  selected,
  onPress,
}: {
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: "48%" }}
      className="rounded-2xl px-4 py-4 mb-3"
    >
      <View
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? COLORS.primary : COLORS.border,
          borderRadius: 16,
          backgroundColor: selected ? COLORS.primaryLight : COLORS.white,
          padding: 14,
        }}
      >
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-[15px] font-bold"
            style={{ color: selected ? COLORS.primary : COLORS.text }}
          >
            {label}
          </Text>
          {selected ? (
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Feather name="check" size={11} color="#fff" />
            </View>
          ) : (
            <View
              className="w-5 h-5 rounded-full"
              style={{ borderWidth: 2, borderColor: COLORS.border }}
            />
          )}
        </View>
        {!!caption && (
          <Text
            className="text-[12px] font-bold"
            style={{ color: COLORS.primary }}
          >
            {caption}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
