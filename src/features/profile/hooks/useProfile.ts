// features/profile/hooks/useProfile.ts
import { useConfirm } from "@/components/common/ConfirmProvider";
import { ROUTES } from "@/config/constants";
import { useGetProfileQuery } from "@/features/auth/api/authApi";
import { performLogout } from "@/store/baseApi";
import { useAppSelector } from "@/store/hooks";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useProfile() {
  const user = useAppSelector((s) => s.auth.user);
  const confirm = useConfirm();
  const isAuthenticated = !!user;

  const { refetch } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // getProfile đã tự setUser trong onQueryStarted nên không cần dispatch lại
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) refetch();
    }, [isAuthenticated, refetch]),
  );

  const displayName = user
    ? `${user.last_name ?? ""} ${user.first_name ?? ""}`.trim() || "Người dùng"
    : "Khách";

  const subtitle = user
    ? user.phone_number || user.email || ""
    : "Đăng nhập để dùng đầy đủ tính năng";

  const logout = async () => {
    const ok = await confirm({
      title: "Đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất không?",
      confirmText: "Đăng xuất",
      danger: true,
    });
    if (!ok) return;
    await performLogout(ROUTES.HOME);
  };

  return {
    isAuthenticated,
    displayName,
    subtitle,
    avatar: user?.avatar ?? null,
    logout,
  };
}
