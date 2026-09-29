// src/components/service/formFieldShared.tsx
import { BottomSheet } from "@/components/ui/BottomSheet";
import { COLORS, SHADOWS } from "@/constants/theme";
import type {
  ConditionalOptionGroup,
  FieldOption,
  FormField,
  PricingConfig,
} from "@/types/Service";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// COLORS giờ lấy từ theme: các file cũ import từ đây vẫn chạy và tự đổi theo theme.
export { COLORS };

export type Values = Record<string, any>;

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

// Chỉ trả về GIÁ, description đã được các card tự hiển thị riêng.
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

// Ô chọn tròn: đã chọn = nền màu chính + dấu tích
function Radio({ selected, size = 24 }: { selected: boolean; size?: number }) {
  return selected ? (
    <View
      className="rounded-full bg-primary items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Feather name="check" size={size * 0.58} color={COLORS.white} />
    </View>
  ) : (
    <View
      className="rounded-full border-2 border-line bg-surface"
      style={{ width: size, height: size }}
    />
  );
}

// ============================================================
// OptionCard — thẻ chọn dọc (Thời lượng, Quy mô nhà, Công suất...)
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
      activeOpacity={0.85}
      className={`flex-row items-center rounded-2xl border-2 p-4 mb-3 ${
        selected ? "bg-primary-soft border-primary" : "bg-surface border-line"
      }`}
      style={selected ? SHADOWS.card : undefined}
    >
      <Radio selected={selected} />
      <View className="flex-1 mx-3">
        <Text
          className={`text-base font-bold ${
            selected ? "text-primary-dark" : "text-ink"
          }`}
        >
          {label}
        </Text>
        {!!description && (
          <Text className="text-[13px] text-ink-muted mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {!!caption && (
        <View
          className={`px-2.5 py-1 rounded-full ${
            selected ? "bg-primary-light" : "bg-canvas"
          }`}
        >
          <Text className="text-[13px] font-bold text-primary-dark">
            {caption}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// ImageOptionCard — lưới 2 cột có ảnh (Loại nhà, Dịch vụ thêm...)
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
        className={`overflow-hidden border-2 bg-surface ${
          selected ? "border-primary" : "border-line"
        }`}
        style={[{ borderRadius: 20 }, selected ? SHADOWS.card : undefined]}
      >
        <View style={{ width: "100%", aspectRatio: 1 }} className="bg-canvas">
          {!!image && (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}
          <View className="absolute top-2 right-2">
            <Radio selected={selected} size={26} />
          </View>
        </View>
        <View className="p-3">
          <Text
            numberOfLines={1}
            className={`text-[14px] font-bold ${
              selected ? "text-primary-dark" : "text-ink"
            }`}
          >
            {label}
          </Text>
          {!!description && (
            <Text
              numberOfLines={2}
              className="text-[11px] mt-0.5 text-ink-muted"
            >
              {description}
            </Text>
          )}
          {!!caption && (
            <View className="self-start mt-2 px-2 py-1 rounded-full bg-primary-light">
              <Text className="text-[12px] font-bold text-primary-dark">
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
// Pill — chip (MULTI_SELECT không ảnh)
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
      activeOpacity={0.85}
      className={`flex-row items-center px-4 py-2.5 rounded-full border mr-2 mb-2 ${
        selected ? "bg-primary border-primary" : "bg-surface border-line"
      }`}
      style={[{ maxWidth: 240 }, selected ? SHADOWS.card : undefined]}
    >
      {selected && (
        <Feather
          name="check"
          size={14}
          color={COLORS.white}
          style={{ marginRight: 6 }}
        />
      )}
      <View className="shrink">
        <Text
          className={`text-[14px] font-semibold ${
            selected ? "text-white" : "text-ink-soft"
          }`}
        >
          {label}
        </Text>
        {!!caption && (
          <Text
            className={`text-[11px] mt-0.5 ${
              selected ? "text-white/80" : "text-ink-muted"
            }`}
          >
            {caption}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// TabBar — thanh tab ngang dạng pill
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
      style={{ flexGrow: 0 }}
      className="mb-4"
      contentContainerStyle={{ paddingRight: 8, gap: 8 }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.85}
            className={`h-10 px-5 rounded-full items-center justify-center border ${
              selected ? "bg-primary border-primary" : "bg-surface border-line"
            }`}
            style={selected ? SHADOWS.card : undefined}
          >
            <Text
              className={`text-[14px] font-bold ${
                selected ? "text-white" : "text-ink-soft"
              }`}
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
// QuantityStepper
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
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View className="flex-row items-center self-start rounded-full bg-canvas p-1">
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        activeOpacity={0.8}
        className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        style={[SHADOWS.card, { opacity: atMin ? 0.45 : 1 }]}
      >
        <Feather name="minus" size={17} color={COLORS.ink} />
      </TouchableOpacity>
      <Text className="mx-5 text-lg font-extrabold min-w-[24px] text-center text-ink">
        {value}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={atMax}
        activeOpacity={0.8}
        className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        style={{ opacity: atMax ? 0.45 : 1 }}
      >
        <Feather name="plus" size={17} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// BooleanToggleRow
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
      className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 mb-3 ${
        value
          ? "bg-primary-soft border-primary-border"
          : "bg-surface border-line"
      }`}
    >
      <View className="flex-1 mr-3">
        <Text className="text-[15px] font-semibold text-ink">{label}</Text>
        {!!description && (
          <Text className="text-[12px] mt-0.5 text-ink-muted">
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryBorder }}
        thumbColor={value ? COLORS.primary : COLORS.white}
      />
    </View>
  );
}

// ============================================================
// WeekdayRow
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
            activeOpacity={0.85}
            className={`w-11 h-11 rounded-full items-center justify-center border ${
              isSelected
                ? "bg-primary border-primary"
                : "bg-surface border-line"
            }`}
            style={isSelected ? SHADOWS.float : undefined}
          >
            <Text
              className={`text-xs font-bold ${
                isSelected ? "text-white" : "text-ink-muted"
              }`}
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
// TimeWheelPicker — 2 cột cuộn giờ / phút (trong BottomSheet của TimeField)
// ============================================================
const WHEEL_ITEM_HEIGHT = 56;
const WHEEL_VISIBLE_COUNT = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_COUNT;
const WHEEL_PADDING = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

function WheelColumn({
  data,
  selectedIndex,
  onChangeIndex,
  formatItem,
}: {
  data: number[];
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
  formatItem: (v: number) => string;
}) {
  const scrollRef = useRef<any>(null);
  const didMount = useRef(false);
  const isInternalUpdate = useRef(false);
  // Vị trí cuộn theo thời gian thực, dùng để nội suy độ đậm từng số
  const scrollY = useRef(
    new Animated.Value(selectedIndex * WHEEL_ITEM_HEIGHT),
  ).current;

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    scrollRef.current?.scrollTo({
      y: selectedIndex * WHEEL_ITEM_HEIGHT,
      animated: didMount.current,
    });
    didMount.current = true;
  }, [selectedIndex]);

  const reportIndexFromOffset = (y: number) => {
    const idx = Math.max(
      0,
      Math.min(data.length - 1, Math.round(y / WHEEL_ITEM_HEIGHT)),
    );
    if (idx !== selectedIndex) {
      isInternalUpdate.current = true;
      onChangeIndex(idx);
    }
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, flex: 1 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      onMomentumScrollEnd={(e) =>
        reportIndexFromOffset(e.nativeEvent.contentOffset.y)
      }
      onScrollEndDrag={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        const nearestSnapY =
          Math.round(y / WHEEL_ITEM_HEIGHT) * WHEEL_ITEM_HEIGHT;
        if (Math.abs(y - nearestSnapY) < 1) reportIndexFromOffset(y);
      }}
    >
      {data.map((v, idx) => {
        const H = WHEEL_ITEM_HEIGHT;
        const inputRange = [
          (idx - 2) * H,
          (idx - 1) * H,
          idx * H,
          (idx + 1) * H,
          (idx + 2) * H,
        ];
        const opacity = scrollY.interpolate({
          inputRange,
          outputRange: [0.1, 0.35, 1, 0.35, 0.1],
          extrapolate: "clamp",
        });
        const scale = scrollY.interpolate({
          inputRange,
          outputRange: [0.8, 0.9, 1, 0.9, 0.8],
          extrapolate: "clamp",
        });

        return (
          <View
            key={v}
            style={{
              height: H,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.Text
              style={{
                fontSize: 42,
                fontWeight: "300",
                color: COLORS.ink,
                opacity,
                transform: [{ scale }],
              }}
            >
              {formatItem(v)}
            </Animated.Text>
          </View>
        );
      })}
    </Animated.ScrollView>
  );
}

function TimeWheelPicker({
  value,
  minHour,
  maxHour,
  onChange,
}: {
  value: string;
  minHour: number;
  maxHour: number;
  onChange: (v: string) => void;
}) {
  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i,
  );
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [hh, mm] = value.split(":");
  const parsedHour = Math.min(
    maxHour,
    Math.max(minHour, parseInt(hh, 10) || minHour),
  );
  const parsedMinute = parseInt(mm, 10) || 0;

  const hourIndex = hours.indexOf(parsedHour);
  const minuteIndex = minutes.indexOf(parsedMinute);

  const commit = (hIdx: number, mIdx: number) => {
    onChange(
      `${String(hours[hIdx]).padStart(2, "0")}:${String(minutes[mIdx]).padStart(2, "0")}`,
    );
  };

  return (
    <View>
      <View className="flex-row mb-2">
        <Text className="flex-1 text-center text-[15px] font-bold text-ink">
          Giờ
        </Text>
        <Text className="flex-1 text-center text-[15px] font-bold text-ink">
          Phút
        </Text>
      </View>

      <View style={{ height: WHEEL_HEIGHT, flexDirection: "row" }}>
        <WheelColumn
          data={hours}
          selectedIndex={hourIndex === -1 ? 0 : hourIndex}
          formatItem={(v) => String(v).padStart(2, "0")}
          onChangeIndex={(idx) =>
            commit(idx, minuteIndex === -1 ? 0 : minuteIndex)
          }
        />
        <WheelColumn
          data={minutes}
          selectedIndex={minuteIndex === -1 ? 0 : minuteIndex}
          formatItem={(v) => String(v).padStart(2, "0")}
          onChangeIndex={(idx) => commit(hourIndex === -1 ? 0 : hourIndex, idx)}
        />
      </View>
    </View>
  );
}

// ============================================================
// TimeField — ô giờ gọn, bấm mở BottomSheet cuộn
// ============================================================
export function TimeField({
  value,
  onChange,
  minHour = 8,
  maxHour = 18,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  minHour?: number;
  maxHour?: number;
}) {
  const defaultValue = `${String(minHour).padStart(2, "0")}:00`;
  const displayValue = value ?? defaultValue;

  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState(displayValue);

  const open = () => {
    setTempValue(value ?? defaultValue);
    setVisible(true);
  };

  const confirm = () => {
    onChange(tempValue);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.85}
        className="flex-row items-center rounded-2xl border border-line bg-surface p-4"
        style={SHADOWS.card}
      >
        <View className="w-11 h-11 rounded-full bg-primary-light items-center justify-center mr-3">
          <Feather name="clock" size={19} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-ink-muted">Giờ bắt đầu</Text>
          <Text className="text-[22px] font-extrabold text-ink">
            {displayValue}
          </Text>
        </View>
        <View className="px-3 py-1.5 rounded-full bg-primary-light">
          <Text className="text-xs font-bold text-primary-dark">Đổi</Text>
        </View>
      </TouchableOpacity>

      <BottomSheet visible={visible} onClose={() => setVisible(false)}>
        <View className="flex-row items-center justify-between px-5 pt-3">
          <TouchableOpacity
            onPress={() => setVisible(false)}
            hitSlop={10}
            className="w-10 h-10 items-center justify-center"
          >
            <Feather name="x" size={26} color={COLORS.ink} />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-lg font-bold text-ink">Chọn giờ làm</Text>
            <Text className="text-xs text-ink-muted mt-0.5">
              Khung giờ {String(minHour).padStart(2, "0")}:00 -{" "}
              {String(maxHour).padStart(2, "0")}:00
            </Text>
          </View>

          <TouchableOpacity
            onPress={confirm}
            hitSlop={10}
            className="w-10 h-10 items-center justify-center"
          >
            <Feather name="check" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View className="px-8 pt-8 pb-4">
          <TimeWheelPicker
            value={tempValue}
            minHour={minHour}
            maxHour={maxHour}
            onChange={setTempValue}
          />
        </View>
      </BottomSheet>
    </>
  );
}

// ============================================================
// DateStripField — dải ngày ngang
// ============================================================
const VN_WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function buildDateRange(startOffsetDays: number, count: number): Date[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const result: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + startOffsetDays + i);
    result.push(d);
  }
  return result;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateStripField({
  value,
  minDaysFromNow = 1,
  rangeDays = 14,
  onChange,
}: {
  value: string | undefined;
  minDaysFromNow?: number;
  rangeDays?: number;
  onChange: (v: string) => void;
}) {
  const dates = buildDateRange(minDaysFromNow, rangeDays);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingRight: 8, paddingVertical: 6, gap: 10 }}
    >
      {dates.map((d) => {
        const key = toDateKey(d);
        const selected = value === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.85}
            className={`items-center justify-center border ${
              selected ? "bg-primary border-primary" : "bg-surface border-line"
            }`}
            style={[
              { width: 60, height: 80, borderRadius: 20 },
              selected ? SHADOWS.float : undefined,
            ]}
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? "text-white/80" : "text-ink-muted"
              }`}
            >
              {VN_WEEKDAY_SHORT[d.getDay()]}
            </Text>
            <Text
              className={`text-[22px] font-extrabold my-0.5 ${
                selected ? "text-white" : "text-ink"
              }`}
            >
              {d.getDate()}
            </Text>
            <Text
              className={`text-[10px] font-medium ${
                selected ? "text-white/70" : "text-ink-muted"
              }`}
            >
              Th{d.getMonth() + 1}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================
// GridOptionCard — thẻ chọn nhỏ 2 cột (VD: Thời hạn gói)
// ============================================================
export function GridOptionCard({
  image,
  label,
  caption,
  selected,
  onPress,
}: {
  image?: string;
  label: string;
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
        className={`border-2 p-3.5 ${
          selected ? "bg-primary-soft border-primary" : "bg-surface border-line"
        }`}
        style={[{ borderRadius: 20 }, selected ? SHADOWS.card : undefined]}
      >
        {!!image && (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              aspectRatio: 1.8,
              borderRadius: 12,
              marginBottom: 10,
            }}
            resizeMode="cover"
          />
        )}
        <View className="flex-row items-center justify-between">
          <Text
            className={`flex-1 mr-2 text-[15px] font-bold ${
              selected ? "text-primary-dark" : "text-ink"
            }`}
          >
            {label}
          </Text>
          <Radio selected={selected} size={22} />
        </View>
        {!!caption && (
          <Text className="text-[13px] font-bold text-primary mt-1.5">
            {caption}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// DISPATCHER: FieldControl
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
              <GridOptionCard
                key={opt.value}
                image={opt.image}
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

    case "MULTI_SELECT": {
      const selected: string[] = Array.isArray(value) ? value : [];
      const toggle = (v: string, isSelected: boolean) =>
        onChange(
          isSelected ? selected.filter((x) => x !== v) : [...selected, v],
        );

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
                  onPress={() => toggle(opt.value, isSelected)}
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
                onPress={() => toggle(opt.value, isSelected)}
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
          className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] text-ink"
          style={{
            minHeight: field.type === "TEXTAREA" ? 96 : undefined,
            textAlignVertical: field.type === "TEXTAREA" ? "top" : "center",
          }}
          placeholder={field.placeholder}
          placeholderTextColor={COLORS.inkMuted}
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

    case "DATE":
      return (
        <DateStripField
          value={value}
          minDaysFromNow={field.min_days_from_now ?? 1}
          onChange={onChange}
        />
      );

    case "TIME":
      return <TimeField value={value} onChange={onChange} />;

    default:
      return null;
  }
}
