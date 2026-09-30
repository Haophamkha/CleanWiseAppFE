import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { EmptyState } from "@/components/ui";
import { COLORS } from "@/constants/theme";
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
  }, [c.items, keyword]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <TabScreenHeader title="Tin nhắn" showBell={c.isLoggedIn}>
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
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Tìm kiếm cuộc trò chuyện"
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
          <RequireLoginNotice message="Đăng nhập để xem tin nhắn với nhân viên" />
        </View>
      ) : c.isInitialLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : c.hasError ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="wifi-off"
            title="Không tải được tin nhắn"
            actionLabel="Thử lại"
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
              colors={[COLORS.primary]}
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
                    ? "Không tìm thấy cuộc trò chuyện phù hợp"
                    : "Chưa có cuộc trò chuyện nào. Tin nhắn với nhân viên sẽ xuất hiện sau khi đơn được nhận."
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
