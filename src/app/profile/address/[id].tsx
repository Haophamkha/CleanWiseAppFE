// app/profile/address/[id].tsx
import ScreenContainer from "@/components/ScreenContainer";
import AddressForm, {
  FormSectionTitle,
} from "@/components/address/AddressForm";
import DefaultAddressSwitch from "@/components/address/DefaultAddressSwitch";
import { MapPickButton } from "@/components/address/MapPickButton";
import ProvinceWardPicker from "@/components/address/ProvinceWardPicker";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button, EmptyState, ErrorText } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { useEditAddress } from "@/features/address/hooks/useEditAddress";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditAddressScreen() {
  const e = useEditAddress();

  const deleteButton =
    e.status === "ready" ? (
      <TouchableOpacity
        onPress={e.remove}
        disabled={e.isDeleting}
        hitSlop={8}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-danger-light items-center justify-center"
      >
        {e.isDeleting ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <Feather name="trash-2" size={18} color={COLORS.danger} />
        )}
      </TouchableOpacity>
    ) : undefined;

  return (
    <ScreenContainer>
      <ScreenHeader title="Cập nhật địa chỉ" right={deleteButton} />

      {e.status === "loading" ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : e.status !== "ready" ? (
        <EmptyState
          icon="alert-circle"
          title={
            e.status === "invalid"
              ? "Địa chỉ không hợp lệ"
              : "Không tải được địa chỉ"
          }
          actionLabel={e.status === "invalid" ? "Quay lại" : "Thử lại"}
          onAction={e.status === "invalid" ? () => router.back() : e.retry}
        />
      ) : (
        <>
          <ScrollView
            className="flex-1 bg-surface"
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FormSectionTitle>Khu vực</FormSectionTitle>
            <ProvinceWardPicker
              initialProvince={e.city}
              initialWard={e.ward}
              onSelect={e.pickProvinceWard}
            />
            <MapPickButton
              label="Hoặc chọn lại trên bản đồ"
              onPress={e.goToMap}
              disabled={e.isNavigating}
            />

            <FormSectionTitle>Thông tin người nhận</FormSectionTitle>
            <AddressForm values={e.values} onChange={e.change} />

            <DefaultAddressSwitch
              isDefault={e.isDefault}
              onValueChange={e.setIsDefault}
              isCurrentDefault={e.isCurrentDefault}
              isEditMode
            />

            <ErrorText message={e.error} />
          </ScrollView>

          <View className="px-5 pt-3 pb-4 bg-surface border-t border-line">
            <Button
              title="Lưu thay đổi"
              onPress={e.submit}
              loading={e.isSaving}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
