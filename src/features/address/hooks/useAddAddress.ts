// features/address/hooks/useAddAddress.ts
import { useCreateAddressMutation } from "@/features/address/api/addressApi";
import { useAddressForm } from "@/features/address/hooks/useAddressForm";
import { setPickedAddress } from "@/features/address/stores/addressPickerSlice";
import { useAppDispatch } from "@/store/hooks";
import { getApiErrorMessage } from "@/utils/apiError";
import { router, useLocalSearchParams } from "expo-router";

export function useAddAddress() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    addressLine?: string;
    ward?: string;
    province?: string;
    pickerKey?: string;
  }>();
  const dispatch = useAppDispatch();
  const form = useAddressForm(params);
  const [createAddress, { isLoading }] = useCreateAddressMutation();

  const submit = async () => {
    if (!form.validate()) return;
    try {
      const created = await createAddress(form.buildPayload()).unwrap();
      if (params.pickerKey) {
        // Đang ở luồng chọn địa chỉ cho dịch vụ: chọn luôn địa chỉ vừa tạo
        // rồi nhảy thẳng về màn dịch vụ (bỏ qua choose-method + list).
        // Số 3 phụ thuộc số màn trong stack, đổi luồng thì phải đổi số này.
        dispatch(setPickedAddress({ key: params.pickerKey, address: created }));
        router.dismiss(3);
      } else {
        router.dismissAll();
      }
    } catch (e) {
      form.setError(
        getApiErrorMessage(e, "Thêm địa chỉ thất bại, vui lòng thử lại"),
      );
    }
  };

  return {
    ...form,
    isLoading,
    submit,
    goToMap: () =>
      form.goToMap(params.pickerKey ? { pickerKey: params.pickerKey } : {}),
  };
}
