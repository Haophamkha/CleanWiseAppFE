// components/address/ProvinceWardPicker.tsx
import { EmptyState, Input } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import {
  Province,
  useGetProvincesQuery,
  useGetWardsByProvinceQuery,
  Ward,
} from "@/services/provinceApi";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
  onSelect: (province: string, ward: string) => void;
};

// Bỏ dấu để gõ "ha noi" vẫn tìm ra "Hà Nội"
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

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
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null,
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [pickerVisible, setPickerVisible] = useState<
    "province" | "ward" | null
  >(null);
  const [search, setSearch] = useState("");

  const { data: provinces, isLoading: loadingProvinces } =
    useGetProvincesQuery();
  const { data: wards, isLoading: loadingWards } = useGetWardsByProvinceQuery(
    selectedProvince?.code ?? 0,
    { skip: !selectedProvince },
  );

  // Điền tỉnh ban đầu (màn sửa, hoặc kết quả từ bản đồ)
  useEffect(() => {
    if (!initialProvince || !provinces?.length) return;
    const province = provinces.find((p) => sameName(p.name, initialProvince));
    if (province) setSelectedProvince(province);
  }, [initialProvince, provinces]);

  // Điền phường/xã sau khi danh sách phường đã tải
  useEffect(() => {
    if (!initialWard) {
      setSelectedWard(null);
      return;
    }
    if (!wards?.length) return;
    const ward = wards.find((w) => sameName(w.name, initialWard));
    if (ward) setSelectedWard(ward);
  }, [initialWard, wards]);

  const isProvince = pickerVisible === "province";
  const items: (Province | Ward)[] = (isProvince ? provinces : wards) ?? [];
  const keyword = normalize(search);
  const filtered = keyword
    ? items.filter((item) => normalize(item.name).includes(keyword))
    : items;
  const selectedCode = isProvince ? selectedProvince?.code : selectedWard?.code;
  const loading = isProvince ? loadingProvinces : loadingWards;

  const closePicker = () => {
    setPickerVisible(null);
    setSearch("");
  };

  const handlePick = (item: Province | Ward) => {
    if (isProvince) {
      setSelectedProvince(item as Province);
      setSelectedWard(null);
      onSelect(item.name, "");
    } else {
      setSelectedWard(item as Ward);
      if (selectedProvince) onSelect(selectedProvince.name, item.name);
    }
    closePicker();
  };

  return (
    <View>
      <PickerField
        label="Tỉnh/Thành phố"
        value={selectedProvince?.name}
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
              keyExtractor={(item) => String(item.code)}
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
                      item.code === selectedCode
                        ? "font-semibold text-primary"
                        : "text-ink"
                    }`}
                  >
                    {item.name}
                  </Text>
                  {item.code === selectedCode && (
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
