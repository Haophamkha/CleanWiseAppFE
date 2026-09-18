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
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

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
// ATOM: TimeWheelPicker — 2 cột cuộn giờ (8-18h) / phút (00-59)
// Dùng bên trong Modal của TimeField, không hiện trực tiếp ngoài form.
// ============================================================
const WHEEL_ITEM_HEIGHT = 48;
const WHEEL_VISIBLE_COUNT = 5; // luôn để số lẻ
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

  // Chỉ dùng để CẬP NHẬT STATE từ vị trí cuộn thực tế — KHÔNG tự scrollTo
  // để snap nữa, vì snapToInterval đã để native tự làm việc đó rồi.
  // Tự scrollTo ở đây sẽ đè lên đà cuộn (momentum) đang chạy dở, gây giật lùi.
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
    <ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, width: 84 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
      onMomentumScrollEnd={(e) => {
        // Đà cuộn đã dừng hẳn -> native đã snap xong, đọc vị trí cuối cùng.
        reportIndexFromOffset(e.nativeEvent.contentOffset.y);
      }}
      onScrollEndDrag={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        const nearestSnapY =
          Math.round(y / WHEEL_ITEM_HEIGHT) * WHEEL_ITEM_HEIGHT;
        // Nếu vừa buông tay mà vị trí đã trùng mốc snap -> chắc chắn sẽ
        // không còn đà cuộn tiếp theo (onMomentumScrollEnd sẽ không bắn),
        // nên xử lý luôn ở đây. Ngược lại, để yên cho đà cuộn tự chạy tiếp
        // rồi onMomentumScrollEnd xử lý sau.
        if (Math.abs(y - nearestSnapY) < 1) {
          reportIndexFromOffset(y);
        }
      }}
      scrollEventThrottle={16}
    >
      {data.map((v, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <View
            key={v}
            style={{
              height: WHEEL_ITEM_HEIGHT,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: isSelected ? 30 : 20,
                fontWeight: isSelected ? "800" : "500",
                color: isSelected ? COLORS.primary : COLORS.textMuted,
                opacity: isSelected ? 1 : 0.45,
              }}
            >
              {formatItem(v)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function TimeWheelPicker({
  value,
  minHour,
  maxHour,
  onChange,
}: {
  value: string; // "HH:MM"
  minHour: number;
  maxHour: number;
  onChange: (v: string) => void;
}) {
  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i,
  );
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 00 -> 59

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
    <View
      style={{
        borderRadius: 20,
        backgroundColor: COLORS.background,
        paddingVertical: 6,
      }}
    >
      <View
        style={{
          height: WHEEL_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: WHEEL_PADDING,
            left: 16,
            right: 16,
            height: WHEEL_ITEM_HEIGHT,
            borderRadius: 14,
            backgroundColor: COLORS.primaryLight,
            borderWidth: 1,
            borderColor: COLORS.primaryBorder,
          }}
        />
        <WheelColumn
          data={hours}
          selectedIndex={hourIndex === -1 ? 0 : hourIndex}
          formatItem={(v) => String(v).padStart(2, "0")}
          onChangeIndex={(idx) =>
            commit(idx, minuteIndex === -1 ? 0 : minuteIndex)
          }
        />
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: COLORS.text,
            marginHorizontal: 6,
          }}
        >
          :
        </Text>
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
// FIELD: TimeField — ô hiển thị giờ gọn, bấm vào mới bung Modal cuộn
// Giờ giới hạn 8h-18h, phút 00-59
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
        activeOpacity={0.8}
        className="flex-row items-center justify-between rounded-2xl px-4 py-4"
        style={{
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.primaryLight }}
          >
            <Feather name="clock" size={16} color={COLORS.primary} />
          </View>
          <Text
            className="text-[14px] font-medium"
            style={{ color: COLORS.textSecondary }}
          >
            Giờ bắt đầu
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text
            className="text-[20px] font-extrabold mr-1"
            style={{ color: COLORS.text }}
          >
            {displayValue}
          </Text>
          <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(17,24,39,0.45)" }}>
          {/* Vùng backdrop để đóng - KHÔNG chứa nội dung sheet */}
          <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)} />

          {/* Sheet là View thường, không nằm trong Touchable nào cả */}
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: 28,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: -4 },
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="items-center pt-3 pb-1">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
                }}
              />
            </View>

            <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={8}>
                <Text
                  className="text-[15px] font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  Huỷ
                </Text>
              </TouchableOpacity>
              <Text
                className="text-[16px] font-bold"
                style={{ color: COLORS.text }}
              >
                Chọn giờ làm
              </Text>
              <TouchableOpacity onPress={confirm} hitSlop={8}>
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: COLORS.primary }}
                >
                  Xong
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-2">
              <TimeWheelPicker
                value={tempValue}
                minHour={minHour}
                maxHour={maxHour}
                onChange={setTempValue}
              />
              <Text
                className="text-[12px] text-center mt-3"
                style={{ color: COLORS.textMuted }}
              >
                Nhận việc trong khung giờ {String(minHour).padStart(2, "0")}
                :00 - {String(maxHour).padStart(2, "0")}:00
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ============================================================
// ATOM: DateStripField — dải ngày ngang, cuộn N ngày kể từ ngày mai
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
  value: string | undefined; // "YYYY-MM-DD"
  minDaysFromNow?: number;
  rangeDays?: number;
  onChange: (v: string) => void;
}) {
  const dates = buildDateRange(minDaysFromNow, rangeDays);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      {dates.map((d) => {
        const key = toDateKey(d);
        const selected = value === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 72,
              borderRadius: 16,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? COLORS.primary : COLORS.white,
              borderWidth: 1,
              borderColor: selected ? COLORS.primary : COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selected ? "#fff" : COLORS.textMuted,
                marginBottom: 4,
              }}
            >
              {VN_WEEKDAY_SHORT[d.getDay()]}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: selected ? "#fff" : COLORS.text,
              }}
            >
              {d.getDate()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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

// ============================================================
// ATOM: GridOptionCard — thẻ chọn nhỏ gọn, 2 cột
// (dùng cho SINGLE_SELECT có field.display === "grid", VD: Thời hạn gói)
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
        {!!image && (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", aspectRatio: 1.8, borderRadius: 10 }}
            resizeMode="cover"
          />
        )}
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
