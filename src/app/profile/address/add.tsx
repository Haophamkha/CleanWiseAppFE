// app/profile/address/add.tsx
import ScreenContainer from "@/components/ScreenContainer";
import AddressForm, {
  FormSectionTitle,
} from "@/components/address/AddressForm";
import { MapPickButton } from "@/components/address/MapPickButton";
import ProvinceWardPicker from "@/components/address/ProvinceWardPicker";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button, ErrorText } from "@/components/ui";
import { useAddAddress } from "@/features/address/hooks/useAddAddress";
import { ScrollView, View } from "react-native";

export default function AddAddressScreen() {
  const a = useAddAddress();

  return (
    <ScreenContainer>
      <ScreenHeader title="Thêm địa chỉ" />

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormSectionTitle>Khu vực</FormSectionTitle>
        <ProvinceWardPicker
          initialProvince={a.city}
          initialWard={a.ward}
          onSelect={a.pickProvinceWard}
        />
        <MapPickButton
          label="Hoặc chọn trên bản đồ"
          onPress={a.goToMap}
          disabled={a.isNavigating}
        />

        <FormSectionTitle>Thông tin người nhận</FormSectionTitle>
        <AddressForm values={a.values} onChange={a.change} />

        <ErrorText message={a.error} />
      </ScrollView>

      <View className="px-5 pt-3 pb-4 bg-surface border-t border-line">
        <Button title="Thêm địa chỉ" onPress={a.submit} loading={a.isLoading} />
      </View>
    </ScreenContainer>
  );
}
