import { useTranslation } from "react-i18next";

// features/address/hooks/useAddressList.ts
import { useGetAddressesQuery } from "@/features/address/api/addressApi";
import { setPickedAddress } from "@/features/address/stores/addressPickerSlice";
import type { Address } from "@/features/address/types/Address";
import { useAppDispatch } from "@/store/hooks";
import { router, useLocalSearchParams } from "expo-router";

export function useAddressList() {
  const { t } = useTranslation();

  const { pickerKey, title } = useLocalSearchParams<{
    pickerKey?: string;
    title?: string;
  }>();
  const isPicking = !!pickerKey;
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, isFetching, refetch } =
    useGetAddressesQuery();

  const edit = (id: number) =>
    router.push({
      pathname: "/profile/address/[id]",
      params: { id: String(id) },
    });

  const select = (address: Address) => {
    if (!pickerKey) return;
    dispatch(setPickedAddress({ key: pickerKey, address }));
    router.back();
  };

  const add = () =>
    router.push({
      pathname: "/profile/address/choose-method",
      params: pickerKey ? { pickerKey } : {},
    });

  return {
    title: title || (isPicking ? t("Chọn địa chỉ") : t("Danh sách địa chỉ đã lưu")),
    addresses: data ?? [],
    isPicking,
    isLoading,
    isError,
    refreshing: isFetching && !isLoading,
    retry: refetch,
    edit,
    select,
    add,
  };
}
