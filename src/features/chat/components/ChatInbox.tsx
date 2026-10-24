import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { EmptyState } from "@/components/ui";

import { ConversationItem } from "@/features/chat/components/ConversationItem";
import { useChatInbox } from "@/features/chat/hooks/useChatInbox";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function ChatInbox() {
  const { t } = useTranslation();

  const { mode: themeMode } = useAppTheme();

  const { COLORS } = useAppTheme();

  const c = useChatInbox();
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return c.items;
    return c.items.filter((item: any) =>
      String(item?.other_user?.name ?? "")
        .toLowerCase()
        .includes(k),
    );
  }, [c.items, keyword, t]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <TabScreenHeader title={t("Tin nhắn")}>
        {c.isLoggedIn && (
          <View
            style={{
              marginTop: 14,
              height: 42,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              borderRadius: 21,
              backgroundColor: COLORS.surface,
            }}
          >
            <Feather name="search" size={18} color={COLORS.inkSoft} />
            <TextInput keyboardAppearance={themeMode}
              value={keyword}
              onChangeText={setKeyword}
              placeholder={t("Tìm kiếm cuộc trò chuyện")}
              placeholderTextColor={COLORS.inkMuted}
              returnKeyType="search"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 15,
                color: COLORS.ink,
                paddingVertical: 0,
              }}
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={() => setKeyword("")} hitSlop={8}>
                <Feather name="x-circle" size={18} color={COLORS.inkSoft} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TabScreenHeader>

      {!c.isLoggedIn ? (
        <View
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}
        >
          <RequireLoginNotice message={t("Đăng nhập để xem tin nhắn với nhân viên")} />
        </View>
      ) : c.isInitialLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : c.hasError ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="wifi-off"
            title={t("Không tải được tin nhắn")}
            actionLabel={t("Thử lại")}
            onAction={c.refresh}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ConversationItem
              item={item}
              onPress={() => c.openConversation(item)}
            />
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={c.refreshing}
              onRefresh={c.refresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primaryFill]}
            />
          }
          onEndReached={c.loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                paddingHorizontal: 32,
              }}
            >
              <EmptyState
                icon={keyword ? "search" : "message-circle"}
                title={
                  keyword
                    ? t("Không tìm thấy cuộc trò chuyện phù hợp")
                    : t("Chưa có cuộc trò chuyện nào. Tin nhắn với nhân viên sẽ xuất hiện sau khi đơn được nhận.")
                }
              />
            </View>
          }
          ListFooterComponent={
            c.isLoadingMore ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginVertical: 12 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
