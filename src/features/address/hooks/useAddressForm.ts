// features/address/hooks/useAddressForm.ts
import type { AddressFormValues } from "@/features/address/components/AddressForm";
import type { Address, AddressPayload } from "@/features/address/types/Address";
import { nameKey } from "@/features/address/utils/regionName";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

// Kết quả bản đồ trả về qua params khi quay lại trang thêm/sửa
export type MapResultParams = {
  latitude?: string;
  longitude?: string;
  addressLine?: string;
  ward?: string;
  province?: string;
};

const EMPTY_VALUES: AddressFormValues = {
  label: "",
  receiver_name: "",
  receiver_phone: "",
  address_line: "",
};

export function useAddressForm(map: MapResultParams) {
  const [values, setValues] = useState<AddressFormValues>(EMPTY_VALUES);
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [latitude, setLatitude] = useState<string | undefined>(undefined);
  const [longitude, setLongitude] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  // Nhận kết quả từ màn chọn vị trí.
  // wardCode do ProvinceWardPicker điền sau khi khớp tên phường với BE;
  // ở đây chỉ xóa khi tỉnh/phường thật sự đổi để không giữ mã cũ.
  useEffect(() => {
    if (!map.latitude || !map.longitude) return;
    setLatitude(map.latitude);
    setLongitude(map.longitude);

    const provinceChanged =
      !!map.province && nameKey(map.province) !== nameKey(city);
    if (map.province) setCity(map.province);

    if (map.ward) {
      if (provinceChanged || nameKey(map.ward) !== nameKey(ward)) {
        setWardCode("");
      }
      setWard(map.ward);
    } else {
      // Không xác định được phường ở vị trí mới -> bắt chọn lại
      setWard("");
      setWardCode("");
    }

    if (map.addressLine) {
      setValues((prev) => ({ ...prev, address_line: map.addressLine! }));
    }
  }, [map.latitude, map.longitude, map.province, map.ward, map.addressLine]);

  const change = (field: keyof AddressFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const pickProvinceWard = (
    province: string,
    selectedWard: string,
    selectedWardCode: string = "",
  ) => {
    setCity(province);
    setWard(selectedWard);
    setWardCode(selectedWardCode);
  };

  // Nạp địa chỉ có sẵn (màn sửa). keepLocation: giữ vị trí vừa chọn từ bản đồ
  const fill = (a: Address, keepLocation: boolean) => {
    setValues((prev) => ({
      label: a.label ?? "",
      receiver_name: a.receiver_name ?? "",
      receiver_phone: a.receiver_phone ?? "",
      address_line: keepLocation ? prev.address_line : (a.address_line ?? ""),
    }));
    if (!keepLocation) {
      setCity(a.city ?? "");
      setWard(a.ward ?? "");
      setWardCode(a.ward_code ?? "");
      setLatitude(a.latitude ?? undefined);
      setLongitude(a.longitude ?? undefined);
    }
    setError("");
  };

  const validate = () => {
    const ok = [
      values.receiver_name,
      values.receiver_phone,
      values.address_line,
      city,
      ward,
    ].every((v) => v.trim());
    if (!ok) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    if (!wardCode) {
      setError("Vui lòng chọn phường/xã từ danh sách");
      return false;
    }
    setError("");
    return true;
  };

  const buildPayload = (): AddressPayload => ({
    label: values.label.trim() || undefined,
    receiver_name: values.receiver_name.trim(),
    receiver_phone: values.receiver_phone.trim(),
    address_line: values.address_line.trim(),
    ward: ward.trim(),
    city: city.trim(),
    ward_code: wardCode,
    latitude,
    longitude,
  });

  const goToMap = (extra: Record<string, string | undefined> = {}) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push({
      pathname: "/profile/address/select-location",
      params: { latitude, longitude, ...extra },
    });
  };

  return {
    values,
    city,
    ward,
    wardCode,
    error,
    setError,
    isNavigating,
    change,
    pickProvinceWard,
    fill,
    validate,
    buildPayload,
    goToMap,
  };
}
