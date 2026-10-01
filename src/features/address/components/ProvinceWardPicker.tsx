// components/address/ProvinceWardPicker.tsx
import { EmptyState, Input } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import {
  useGetAreaProvincesQuery,
  useGetAreaWardsQuery,
} from "@/features/address/api/addressApi";
import type { AreaProvince, AreaWard } from "@/features/address/types/Address";
import { sameName } from "@/features/address/utils/regionName";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  initialProvince?: string;
  initialWard?: string;
  onSelect: (province: string, ward: string, wardCode: string) => void;
};

// Bỏ dấu để gõ "ha noi" vẫn tìm ra "Hà Nội"
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

function PickerField({
  label,
  value,
  placeholder,
  disabled,
  onPress,
}: {
  label: string;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-ink mb-2">{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between bg-canvas border border-line rounded-lg px-4 py-4 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 mr-2 text-base ${
            value ? "text-ink" : "text-ink-muted"
          }`}
        >
          {value ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={COLORS.inkMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProvinceWardPicker({
  initialProvince = "",
  initialWard = "",
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selectedProvince, setSelectedProvince] = useState<AreaProvince | null>(
    null,
  );
  const [selectedWard, setSelectedWard] = useState<AreaWard | null>(null);
  const [pickerVisible, setPickerVisible] = useState<
    "province" | "ward" | null
  >(null);
  const [search, setSearch] = useState("");
  // ward_code đã báo lên form, tránh gọi onSelect lặp
  const notified = useRef("");

  const { data: provinces, isLoading: loadingProvinces } =
    useGetAreaProvincesQuery();
  // currentData: không dùng nhầm danh sách phường của tỉnh trước
  const { currentData: wards, isFetching: loadingWards } = useGetAreaWardsQuery(
    selectedProvince?.province_code ?? "",
    {
      skip: !selectedProvince,
    },
  );

  // Điền tỉnh từ tên (màn sửa, hoặc kết quả từ bản đồ)
  useEffect(() => {
    if (!initialProvince || !provinces?.length) return;
    const province = provinces.find((p) => sameName(p.city, initialProvince));
    if (province) setSelectedProvince(province);
  }, [initialProvince, provinces]);

  // Điền phường từ tên, rồi báo ward_code lên form.
  // Không khớp được -> xóa phường để người dùng chọn lại.
  useEffect(() => {
    if (!initialWard) {
      notified.current = "";
      setSelectedWard(null);
      return;
    }
    if (!selectedProvince || !wards) return;
    // Đang chờ selectedProvince đồng bộ với initialProvince mới
    if (!sameName(selectedProvince.city, initialProvince)) return;

    const ward = wards.find((w) => sameName(w.name, initialWard));
    setSelectedWard(ward ?? null);
    if (ward) {
      if (notified.current !== ward.ward_code) {
        notified.current = ward.ward_code;
        onSelect(selectedProvince.city, ward.name, ward.ward_code);
      }
    } else {
      notified.current = "";
      onSelect(selectedProvince.city, "", "");
    }
  }, [initialProvince, initialWard, selectedProvince, wards]);

  const isProvince = pickerVisible === "province";
  const items: (AreaProvince | AreaWard)[] =
    (isProvince ? provinces : wards) ?? [];
  const labelOf = (item: AreaProvince | AreaWard) =>
    isProvince ? (item as AreaProvince).city : (item as AreaWard).name;
  const codeOf = (item: AreaProvince | AreaWard) =>
    isProvince
      ? (item as AreaProvince).province_code
      : (item as AreaWard).ward_code;

  const keyword = fold(search);
  const filtered = keyword
    ? items.filter((item) => fold(labelOf(item)).includes(keyword))
    : items;
  const selectedCode = isProvince
    ? selectedProvince?.province_code
    : selectedWard?.ward_code;
  const loading = isProvince ? loadingProvinces : loadingWards;

  const closePicker = () => {
    setPickerVisible(null);
    setSearch("");
  };

  const handlePick = (item: AreaProvince | AreaWard) => {
    if (isProvince) {
      const province = item as AreaProvince;
      setSelectedProvince(province);
      setSelectedWard(null);
      notified.current = "";
      onSelect(province.city, "", "");
    } else {
      const ward = item as AreaWard;
      setSelectedWard(ward);
      notified.current = ward.ward_code;
      if (selectedProvince) {
        onSelect(selectedProvince.city, ward.name, ward.ward_code);
      }
    }
    closePicker();
  };

  return (
    <View>
      <PickerField
        label="Tỉnh/Thành phố"
        value={selectedProvince?.city}
        placeholder="Chọn tỉnh/thành phố"
        onPress={() => setPickerVisible("province")}
      />
      <PickerField
        label="Phường/Xã"
        value={selectedWard?.name}
        placeholder={
          selectedProvince ? "Chọn phường/xã" : "Vui lòng chọn tỉnh/thành trước"
        }
        disabled={!selectedProvince}
        onPress={() => setPickerVisible("ward")}
      />

      <Modal
        visible={pickerVisible !== null}
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View
          className="flex-1 bg-surface"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-line">
            <Text className="text-lg font-bold text-ink">
              {isProvince ? "Chọn tỉnh/thành phố" : "Chọn phường/xã"}
            </Text>
            <TouchableOpacity
              onPress={closePicker}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-canvas items-center justify-center"
            >
              <Feather name="x" size={20} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-4">
            <Input
              icon="search"
              placeholder="Tìm kiếm..."
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => codeOf(item)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 24,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handlePick(item)}
                  activeOpacity={0.6}
                  className="flex-row items-center justify-between py-4 border-b border-line"
                >
                  <Text
                    className={`flex-1 mr-3 text-base ${
                      codeOf(item) === selectedCode
                        ? "font-semibold text-primary"
                        : "text-ink"
                    }`}
                  >
                    {labelOf(item)}
                  </Text>
                  {codeOf(item) === selectedCode && (
                    <Feather name="check" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <EmptyState icon="search" title="Không tìm thấy dữ liệu" />
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
