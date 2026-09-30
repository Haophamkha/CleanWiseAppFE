// app/profile/edit.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  Avatar,
  Button,
  EmptyState,
  ErrorText,
  Input,
  type FeatherName,
} from "@/components/ui";
import { COLORS } from "@/constants/theme";
import {
  useEditProfile,
  type EditProfileKey,
} from "@/features/profile/hooks/useEditProfile";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type FieldConfig = {
  key: EditProfileKey;
  label: string;
  icon: FeatherName;
  placeholder: string;
  keyboardType?: "phone-pad" | "email-address" | "default";
  autoCapitalize?: "none" | "words";
};

const FIELDS: FieldConfig[] = [
  {
    key: "last_name",
    label: "Họ và tên đệm",
    icon: "user",
    placeholder: "Nhập họ và tên đệm",
    autoCapitalize: "words",
  },
  {
    key: "first_name",
    label: "Tên",
    icon: "user",
    placeholder: "Nhập tên",
    autoCapitalize: "words",
  },
  {
    key: "phone_number",
    label: "Số điện thoại",
    icon: "phone",
    placeholder: "Nhập số điện thoại",
    keyboardType: "phone-pad",
  },
  {
    key: "email",
    label: "Email",
    icon: "mail",
    placeholder: "Nhập email",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
];
export default function EditProfileScreen() {
  const e = useEditProfile();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Chỉnh sửa thông tin"
        onBack={e.goBack}
        disabled={e.isUpdating}
      />

      {e.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : e.loadError ? (
        <EmptyState
          icon="wifi-off"
          title="Không tải được thông tin"
          actionLabel="Thử lại"
          onAction={e.retry}
        />
      ) : (
        <>
          <ScrollView
            className="flex-1 bg-surface"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Ảnh đại diện */}
            <View className="items-center mb-8">
              <View style={{ width: 132, height: 132 }}>
                <TouchableOpacity
                  onPress={e.pickAvatar}
                  disabled={e.isUpdating}
                  activeOpacity={0.85}
                  className="p-1 rounded-full border-2 border-primary-border bg-surface"
                >
                  <Avatar uri={e.avatarUri} size={120} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={e.pickAvatar}
                  disabled={e.isUpdating}
                  activeOpacity={0.85}
                  className="absolute w-10 h-10 rounded-full bg-primary items-center justify-center border-2 border-surface"
                  style={{ right: 2, bottom: 2 }}
                >
                  <Feather name="camera" size={17} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>

            {FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                icon={field.icon}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType ?? "default"}
                autoCapitalize={field.autoCapitalize ?? "none"}
                value={e.form[field.key]}
                onChangeText={(v) => e.update(field.key, v)}
                editable={!e.isUpdating}
              />
            ))}

            <ErrorText message={e.error} />
          </ScrollView>

          <View className="px-5 pt-3 pb-4 bg-surface border-t border-line">
            <Button
              title="Lưu thay đổi"
              onPress={e.submit}
              loading={e.isUpdating}
              disabled={!e.hasChanges}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
