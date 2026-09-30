// features/profile/hooks/useEditProfile.ts
import { ROUTES } from "@/config/constants";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
} from "@/features/auth/api/authApi";
import type { PickedFile } from "@/features/complaint/types/Complaint";
import { getApiErrorMessage } from "@/utils/apiError";
import { pickImage } from "@/utils/imagePicker";
import { showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export type EditProfileKey =
  | "first_name"
  | "last_name"
  | "phone_number"
  | "email";

const EMPTY_FORM: Record<EditProfileKey, string> = {
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
};
const KEYS = Object.keys(EMPTY_FORM) as EditProfileKey[];

export function useEditProfile() {
  const {
    data: profile,
    isLoading,
    error: loadError,
    refetch,
  } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [avatar, setAvatar] = useState<PickedFile | null>(null);
  const [error, setError] = useState("");

  // Nạp dữ liệu từ server vào form
  useEffect(() => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone_number: profile.phone_number ?? "",
      email: profile.email ?? "",
    });
    setAvatar(null);
  }, [profile]);

  const update = (key: EditProfileKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const hasChanges =
    avatar !== null ||
    KEYS.some((k) => form[k].trim() !== (profile?.[k] ?? ""));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.HOME);
  };

  const pickAvatar = async () => {
    const file = await pickImage({ square: true });
    if (file) setAvatar(file);
  };

  const submit = async () => {
    if (!hasChanges || isUpdating) return;
    setError("");
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        ...(avatar
          ? {
              avatar: {
                uri: avatar.uri,
                name: avatar.name ?? `avatar-${Date.now()}.jpg`,
                type: avatar.type ?? "image/jpeg",
              },
            }
          : {}),
      }).unwrap();
      showSuccessToast("Đã cập nhật", "Thông tin cá nhân đã được lưu");
      goBack();
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "Không thể cập nhật thông tin. Vui lòng thử lại.",
        ),
      );
    }
  };

  return {
    isLoading,
    loadError: !!loadError,
    retry: refetch,
    form,
    update,
    avatarUri: avatar?.uri ?? profile?.avatar ?? null,
    pickAvatar,
    hasChanges,
    isUpdating,
    error,
    submit,
    goBack,
  };
}
