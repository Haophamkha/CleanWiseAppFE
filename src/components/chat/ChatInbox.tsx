import { ConversationItem } from "@/components/chat/ConversationItem";
import { EmptyState } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { COLORS, GRADIENTS } from "@/constants/theme";
import { useChatInbox } from "@/features/chat/hooks/useChatInbox";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ChatInbox() {
  const c = useChatInbox();
  const insets = useSafeAreaInsets();
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
      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 14,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#000" }}>
            Tin nhắn
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/notifications" as any)}
            hitSlop={8}
          >
            <Feather name="bell" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {c.isLoggedIn && (
          <View
            style={{
              marginTop: 12,
              height: 42,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              borderRadius: 21,
              backgroundColor: "#fff",
            }}
          >
            <Feather name="search" size={20} color={COLORS.inkSoft} />
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Tìm kiếm cuộc trò chuyện"
              placeholderTextColor={COLORS.inkSoft}
              returnKeyType="search"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: "#000",
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
      </LinearGradient>

      {!c.isLoggedIn ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="lock"
            title="Đăng nhập để xem tin nhắn"
            actionLabel="Đăng nhập"
            onAction={() => router.push(ROUTES.LOGIN as any)}
          />
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
