import {
    Province,
    useGetProvincesQuery,
    useGetWardsByProvinceQuery,
    Ward,
} from "@/services/provinceApi";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  initialProvince?: string;
  initialWard?: string;
  onSelect: (province: string, ward: string) => void;
};

export default function ProvinceWardPicker({
  initialProvince = "",
  initialWard = "",
  onSelect,
}: Props) {
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
    {
      skip: !selectedProvince,
    },
  );

  // Fill tỉnh ban đầu khi Edit
  useEffect(() => {
    if (!initialProvince || !provinces?.length) return;

    const province = provinces.find(
      (item) =>
        item.name.trim().toLowerCase() === initialProvince.trim().toLowerCase(),
    );

    if (province) {
      setSelectedProvince(province);
    }
  }, [initialProvince, provinces]);

  // Fill xã/phường ban đầu sau khi đã load wards
  useEffect(() => {
    if (!initialWard || !wards?.length) return;

    const ward = wards.find(
      (item) =>
        item.name.trim().toLowerCase() === initialWard.trim().toLowerCase(),
    );

    if (ward) {
      setSelectedWard(ward);
    }
  }, [initialWard, wards]);

  const filteredProvinces = (provinces ?? []).filter((province) =>
    province.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredWards = (wards ?? []).filter((ward) =>
    ward.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handlePickProvince = (province: Province) => {
    setSelectedProvince(province);
    setSelectedWard(null);

    setPickerVisible(null);
    setSearch("");

    // Chưa có ward mới nên reset ward
    onSelect(province.name, "");
  };

  const handlePickWard = (ward: Ward) => {
    setSelectedWard(ward);

    if (selectedProvince) {
      onSelect(selectedProvince.name, ward.name);
    }

    setPickerVisible(null);
    setSearch("");
  };

  const closePicker = () => {
    setPickerVisible(null);
    setSearch("");
  };

  return (
    <View>
      {/* TỈNH / THÀNH PHỐ */}
      <Text className="text-gray-700 font-medium mb-1">Tỉnh/Thành phố</Text>

      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4"
        onPress={() => setPickerVisible("province")}
      >
        <Text className={selectedProvince ? "text-gray-900" : "text-gray-400"}>
          {selectedProvince?.name ?? "Chọn tỉnh/thành phố"}
        </Text>

        <Feather name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* PHƯỜNG / XÃ */}
      <Text className="text-gray-700 font-medium mb-1">Phường/Xã</Text>

      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4"
        onPress={() => {
          if (selectedProvince) {
            setPickerVisible("ward");
          }
        }}
        disabled={!selectedProvince}
      >
        <Text className={selectedWard ? "text-gray-900" : "text-gray-400"}>
          {selectedWard?.name ??
            (selectedProvince
              ? "Chọn phường/xã"
              : "Vui lòng chọn tỉnh/thành trước")}
        </Text>

        <Feather name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={pickerVisible !== null}
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View className="flex-1 bg-white pt-14 px-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              {pickerVisible === "province"
                ? "Chọn tỉnh/thành phố"
                : "Chọn phường/xã"}
            </Text>

            <TouchableOpacity onPress={closePicker}>
              <Feather name="x" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholder="Tìm kiếm..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />

          {(pickerVisible === "province" ? loadingProvinces : loadingWards) ? (
            <Text className="text-gray-400 text-center mt-10">Đang tải...</Text>
          ) : (
            <FlatList
              data={
                pickerVisible === "province" ? filteredProvinces : filteredWards
              }
              keyExtractor={(item) => String(item.code)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 border-b border-gray-100"
                  onPress={() =>
                    pickerVisible === "province"
                      ? handlePickProvince(item as Province)
                      : handlePickWard(item as Ward)
                  }
                >
                  <Text className="text-gray-900">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-gray-400 text-center mt-10">
                  Không tìm thấy dữ liệu
                </Text>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
