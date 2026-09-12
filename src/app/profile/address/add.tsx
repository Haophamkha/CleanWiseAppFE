import ScreenContainer from "@/components/ScreenContainer";
import AddressForm, {
  AddressFormValues,
} from "@/components/address/AddressForm";
import DefaultAddressSwitch from "@/components/address/DefaultAddressSwitch"; // <-- Import component chung
import ProvinceWardPicker from "@/components/address/ProvinceWardPicker";
import { useCreateAddressMutation } from "@/services/addressApi";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AddAddressScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    addressLine?: string;
    ward?: string;
    province?: string;
  }>();

  const [values, setValues] = useState<AddressFormValues>({
    label: "",
    receiver_name: "",
    receiver_phone: "",
    address_line: "",
  });
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");
  const [latitude, setLatitude] = useState<string | undefined>(undefined);
  const [longitude, setLongitude] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const [createAddress, { isLoading }] = useCreateAddressMutation();

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  useEffect(() => {
    if (!params.latitude || !params.longitude) return;
    setLatitude(params.latitude);
    setLongitude(params.longitude);
    if (params.province) setCity(params.province);
    if (params.ward) setWard(params.ward);
    if (params.addressLine) {
      setValues((prev) => ({ ...prev, address_line: params.addressLine! }));
    }
  }, [
    params.latitude,
    params.longitude,
    params.province,
    params.ward,
    params.addressLine,
  ]);

  const handleChange = (field: keyof AddressFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickProvinceWard = (province: string, selectedWard: string) => {
    setCity(province);
    setWard(selectedWard);
  };

  const handleGoToMap = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push({
      pathname: "/profile/address/select-location",
      params: { latitude, longitude },
    });
  };

  const handleConfirm = async () => {
    if (
      !values.receiver_name.trim() ||
      !values.receiver_phone.trim() ||
      !values.address_line.trim() ||
      !city.trim() ||
      !ward.trim()
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setError("");

    try {
      await createAddress({
        label: values.label.trim() || undefined,
        receiver_name: values.receiver_name.trim(),
        receiver_phone: values.receiver_phone.trim(),
        address_line: values.address_line.trim(),
        ward: ward.trim(),
        city: city.trim(),
        latitude,
        longitude,
        is_default: isDefault,
      }).unwrap();

      router.dismissAll();
    } catch (e: any) {
      const backendErrors = e?.data?.errors;
      if (backendErrors) {
        const firstError = Object.values(backendErrors).flat().find(Boolean);
        setError(
          typeof firstError === "string"
            ? firstError
            : "Dữ liệu địa chỉ không hợp lệ",
        );
      } else {
        setError(e?.data?.message || "Thêm địa chỉ thất bại, vui lòng thử lại");
      }
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Thêm địa chỉ</Text>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ProvinceWardPicker
            initialProvince={city}
            initialWard={ward}
            onSelect={handlePickProvinceWard}
          />

          <TouchableOpacity
            className="flex-row items-center justify-center border border-emerald-700 rounded-xl py-3 mb-5"
            onPress={handleGoToMap}
            disabled={isNavigating}
          >
            <Feather
              name="map-pin"
              size={16}
              color="#047857"
              style={{ marginRight: 8 }}
            />
            <Text className="text-emerald-700 font-semibold">
              Hoặc chọn trên bản đồ
            </Text>
          </TouchableOpacity>

          <AddressForm values={values} onChange={handleChange} />

          {/* Dùng chung component cho màn Add */}
          <DefaultAddressSwitch
            isDefault={isDefault}
            onValueChange={setIsDefault}
            isEditMode={false}
          />

          {!!error && (
            <Text className="text-red-500 text-sm mb-3">{error}</Text>
          )}
        </ScrollView>

        <View className="px-6 pb-8 pt-4 border-t border-gray-100">
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">
              {isLoading ? "Đang lưu..." : "Thêm địa chỉ"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
