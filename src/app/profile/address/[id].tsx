import ScreenContainer from "@/components/ScreenContainer";
import AddressForm, {
  AddressFormValues,
} from "@/components/address/AddressForm";
import DefaultAddressSwitch from "@/components/address/DefaultAddressSwitch"; // <-- Import component chung
import ProvinceWardPicker from "@/components/address/ProvinceWardPicker";
import {
  useDeleteAddressMutation,
  useGetAddressDetailQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "@/services/addressApi";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditAddressScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    latitude?: string;
    longitude?: string;
    addressLine?: string;
    ward?: string;
    province?: string;
  }>();

  const addressId = Number(params.id);

  const {
    data: address,
    isLoading: isLoadingDetail,
    isError,
    error: detailError,
  } = useGetAddressDetailQuery(addressId, {
    skip: !params.id || !Number.isFinite(addressId),
    refetchOnMountOrArgChange: true,
  });

  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();

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
  const [hydrated, setHydrated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  useEffect(() => {
    if (!address || hydrated) return;

    setValues({
      label: address.label ?? "",
      receiver_name: address.receiver_name ?? "",
      receiver_phone: address.receiver_phone ?? "",
      address_line: address.address_line ?? "",
    });
    setCity(address.city ?? "");
    setWard(address.ward ?? "");
    setLatitude(address.latitude ?? undefined);
    setLongitude(address.longitude ?? undefined);
    setIsDefault(address.is_default ?? false);
    setHydrated(true);
    setError("");
  }, [address, hydrated]);

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
      params: { editId: String(addressId), latitude, longitude },
    });
  };

  const handleUpdate = async () => {
    if (!address) return;

    const receiverName = values.receiver_name.trim();
    const receiverPhone = values.receiver_phone.trim();
    const addressLine = values.address_line.trim();

    if (
      !receiverName ||
      !receiverPhone ||
      !addressLine ||
      !city.trim() ||
      !ward.trim()
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setError("");

    try {
      await updateAddress({
        id: addressId,
        payload: {
          label: values.label.trim() || undefined,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          address_line: addressLine,
          ward: ward.trim(),
          city: city.trim(),
          latitude,
          longitude,
        },
      }).unwrap();

      if (isDefault && !address.is_default) {
        await setDefaultAddress(addressId).unwrap();
      }

      router.back();
    } catch (e: any) {
      if (__DEV__) {
        console.log("[UPDATE ADDRESS ERROR]", e);
      }
      const backendErrors = e?.data?.errors;
      if (backendErrors) {
        const firstError = Object.values(backendErrors).flat().find(Boolean);
        setError(
          typeof firstError === "string" ? firstError : "Dữ liệu không hợp lệ",
        );
      } else {
        setError(e?.data?.message || "Cập nhật thất bại, vui lòng thử lại");
      }
    }
  };

  const handleDelete = () => {
    if (address?.is_default) {
      Alert.alert(
        "Không thể xóa",
        "Địa chỉ mặc định không thể xóa. Vui lòng đặt địa chỉ khác làm mặc định trước.",
      );
      return;
    }

    Alert.alert("Xóa địa chỉ", "Bạn có chắc muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(addressId).unwrap();
            router.back();
          } catch (e: any) {
            setError(
              e?.data?.message || "Xóa địa chỉ thất bại, vui lòng thử lại",
            );
          }
        },
      },
    ]);
  };

  if (!params.id || !Number.isFinite(addressId)) {
    return (
      <ScreenContainer>
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-red-500 text-center">Địa chỉ không hợp lệ</Text>
          <TouchableOpacity
            className="mt-4 bg-emerald-700 rounded-xl px-6 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoadingDetail && !hydrated) {
    return (
      <ScreenContainer>
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator color="#047857" size="small" />
          <Text className="text-gray-500 mt-3">Đang tải địa chỉ...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !address) {
    return (
      <ScreenContainer>
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Feather name="alert-circle" size={36} color="#DC2626" />
          <Text className="text-gray-900 font-bold text-base mt-4">
            Không tải được địa chỉ
          </Text>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl px-6 py-3 mt-5"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Feather name="arrow-left" size={22} color="#111827" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">
              Cập nhật địa chỉ
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting}
            className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Feather name="trash-2" size={16} color="#DC2626" />
            )}
          </TouchableOpacity>
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
              Hoặc chọn lại trên bản đồ
            </Text>
          </TouchableOpacity>

          <AddressForm values={values} onChange={handleChange} />

          {/* Dùng component chung cho màn Edit */}
          <DefaultAddressSwitch
            isDefault={isDefault}
            onValueChange={setIsDefault}
            isCurrentDefault={address?.is_default}
            isEditMode={true}
          />

          {!!error && (
            <Text className="text-red-500 text-sm mb-3">{error}</Text>
          )}
        </ScrollView>

        <View className="px-6 pb-8 pt-4 border-t border-gray-100">
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            onPress={handleUpdate}
            disabled={isUpdating || isSettingDefault}
          >
            <Text className="text-white font-bold text-base">
              {isUpdating || isSettingDefault ? "Đang cập nhật..." : "Cập nhật"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
