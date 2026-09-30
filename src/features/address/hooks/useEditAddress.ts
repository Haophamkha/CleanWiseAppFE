// features/address/hooks/useEditAddress.ts
import { useConfirm } from "@/components/common/ConfirmProvider";
import {
    useDeleteAddressMutation,
    useGetAddressDetailQuery,
    useSetDefaultAddressMutation,
    useUpdateAddressMutation,
} from "@/features/address/api/addressApi";
import { useAddressForm } from "@/features/address/hooks/useAddressForm";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast } from "@/utils/toast";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export type EditAddressStatus = "invalid" | "loading" | "error" | "ready";

export function useEditAddress() {
  const params = useLocalSearchParams<{
    id?: string;
    latitude?: string;
    longitude?: string;
    addressLine?: string;
    ward?: string;
    province?: string;
  }>();
  const confirm = useConfirm();

  const addressId = Number(params.id);
  const validId = !!params.id && Number.isFinite(addressId);

  const {
    data: address,
    isLoading: isLoadingDetail,
    isError,
    refetch,
  } = useGetAddressDetailQuery(addressId, {
    skip: !validId,
    refetchOnMountOrArgChange: true,
  });

  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();

  const form = useAddressForm(params);
  const [isDefault, setIsDefault] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!address || hydrated) return;
    // Nếu vừa quay về từ bản đồ thì giữ vị trí mới, không ghi đè bằng dữ liệu cũ
    form.fill(address, !!(params.latitude && params.longitude));
    setIsDefault(address.is_default ?? false);
    setHydrated(true);
  }, [address, hydrated]);

  const status: EditAddressStatus = !validId
    ? "invalid"
    : isLoadingDetail && !hydrated
      ? "loading"
      : isError || !address
        ? "error"
        : "ready";

  const submit = async () => {
    if (!address || !form.validate()) return;
    try {
      await updateAddress({
        id: addressId,
        payload: form.buildPayload(),
      }).unwrap();
      if (isDefault && !address.is_default) {
        await setDefaultAddress(addressId).unwrap();
      }
      router.back();
    } catch (e) {
      form.setError(
        getApiErrorMessage(e, "Cập nhật thất bại, vui lòng thử lại"),
      );
    }
  };

  const remove = async () => {
    if (address?.is_default) {
      showErrorToast(
        "Không thể xóa",
        "Hãy đặt địa chỉ khác làm mặc định trước.",
      );
      return;
    }
    const ok = await confirm({
      title: "Xóa địa chỉ",
      message: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      confirmText: "Xóa",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteAddress(addressId).unwrap();
      router.back();
    } catch (e) {
      form.setError(
        getApiErrorMessage(e, "Xóa địa chỉ thất bại, vui lòng thử lại"),
      );
    }
  };

  return {
    ...form,
    status,
    retry: refetch,
    isDefault,
    setIsDefault,
    isCurrentDefault: !!address?.is_default,
    isSaving: isUpdating || isSettingDefault,
    isDeleting,
    submit,
    remove,
    goToMap: () => form.goToMap({ editId: String(addressId) }),
  };
}
