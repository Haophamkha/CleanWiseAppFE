import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
// app/profile/address/[id].tsx
import { ScreenHeader } from "@/components/common/ScreenHeader";
import ScreenContainer from "@/components/ScreenContainer";
import { Button, EmptyState, ErrorText } from "@/components/ui";

import AddressForm, {
  FormSectionTitle,
} from "@/features/address/components/AddressForm";
import DefaultAddressSwitch from "@/features/address/components/DefaultAddressSwitch";
import { MapPickButton } from "@/features/address/components/MapPickButton";
import ProvinceWardPicker from "@/features/address/components/ProvinceWardPicker";
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
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

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
      <ScreenHeader title={t("Cập nhật địa chỉ")} right={deleteButton} />

      {e.status === "loading" ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : e.status !== "ready" ? (
        <EmptyState
          icon="alert-circle"
          title={
            e.status === "invalid"
              ? t("Địa chỉ không hợp lệ")
              : t("Không tải được địa chỉ")
          }
          actionLabel={e.status === "invalid" ? t("Quay lại") : t("Thử lại")}
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
            <FormSectionTitle>{t("Khu vực")}</FormSectionTitle>
            <ProvinceWardPicker
              initialProvince={e.city}
              initialWard={e.ward}
              onSelect={e.pickProvinceWard}
            />
            <MapPickButton
              label={t("Hoặc chọn lại trên bản đồ")}
              onPress={e.goToMap}
              disabled={e.isNavigating}
            />

            <FormSectionTitle>{t("Thông tin người nhận")}</FormSectionTitle>
            <AddressForm
              values={e.values}
              onChange={e.change}
              canToggle={e.canToggle}
              showContact={e.showContact}
              isOther={e.isOther}
              onToggleOther={e.toggleOther}
            />

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
              title={t("Lưu thay đổi")}
              onPress={e.submit}
              loading={e.isSaving}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
