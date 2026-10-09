import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  useDeleteChatbotConversationMutation,
  useGetChatbotConversationsQuery,
} from "../api/chatbotApi";
import type { ChatbotConversation } from "../types/chatbot";
import { chatbotErrorMessage } from "../utils/chatbotUtils";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: number;
  selectedId?: number;
  onSelect: (item: ChatbotConversation) => void;
  onDeleted: (id: number) => void;
};

export function ChatbotHistorySheet({
  visible,
  onClose,
  userId,
  selectedId,
  onSelect,
  onDeleted,
}: Props) {
  const { height } = useWindowDimensions();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatbotConversation[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConversation] = useDeleteChatbotConversationMutation();
  const deleting = useRef(false);
  const deletedIds = useRef(new Set<number>());
  const onDeletedRef = useRef(onDeleted);
  onDeletedRef.current = onDeleted;
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const confirmDelete = (item: ChatbotConversation) => {
    Alert.alert(
      "Xóa cuộc trò chuyện?",
      `Toàn bộ tin nhắn trong “${item.title || "Cuộc trò chuyện mới"}” sẽ bị xóa và không thể khôi phục.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            if (deleting.current || !alive.current) return;
            deleting.current = true;
            setDeletingId(item.id);
            try {
              await deleteConversation(item.id).unwrap();
            } catch (error) {
              if (!alive.current) return;
              const status = (error as { status?: number })?.status;
              if (status !== 404) {
                Alert.alert(
                  "Không thể xóa cuộc trò chuyện",
                  status === 409 ||
                    status === 401 ||
                    status === 403 ||
                    status === 429
                    ? chatbotErrorMessage(error)
                    : "Vui lòng kiểm tra kết nối và thử lại.",
                );
                return;
              }
            } finally {
              deleting.current = false;
              if (alive.current) setDeletingId(null);
            }
            if (!alive.current) return;
            deletedIds.current.add(item.id);
            setItems((current) => current.filter((entry) => entry.id !== item.id));
            setPage(1);
            onDeletedRef.current(item.id);
            // Restart pagination since deleting a row shifts page boundaries.
            void refetch();
          },
        },
      ],
    );
  };
  const { currentData, isFetching, isError, refetch } =
    useGetChatbotConversationsQuery(
      { userId, page },
      {
        skip: !visible,
        refetchOnMountOrArgChange: true,
      },
    );
  useEffect(() => {
    if (visible) {
      setPage(1);
      setItems([]);
    }
  }, [visible]);
  useEffect(() => {
    if (!visible || !currentData) return;
    setItems((current) =>
      page === 1
        ? currentData.results.filter((item) => !deletedIds.current.has(item.id))
        : [
            ...new Map(
              [...current, ...currentData.results].map((item) => [
                item.id,
                item,
              ]),
            ).values(),
          ].filter((item) => !deletedIds.current.has(item.id)),
    );
  }, [currentData, page, visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        if (!deleting.current) onClose();
      }}
    >
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <View>
          <Text className="text-ink text-xl font-extrabold">
            Lịch sử trò chuyện
          </Text>
          <Text className="text-ink-soft text-xs mt-1">
            Tiếp tục câu chuyện cùng trợ lý
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          disabled={deletingId !== null}
          accessibilityRole="button"
          accessibilityLabel="Đóng lịch sử"
          className="w-10 h-10 rounded-full bg-canvas items-center justify-center"
        >
          <Feather name="x" size={20} color={COLORS.inkSoft} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        style={{ maxHeight: height * 0.6 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center border rounded-2xl mb-2 ${selectedId === item.id ? "bg-primary-soft border-primary-border" : "bg-canvas border-line"}`}
          >
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              disabled={deletingId !== null}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedId === item.id }}
              className="flex-1 flex-row items-center p-4 pr-2"
            >
              <Feather name="message-circle" size={18} color={COLORS.primary} />
              <View className="flex-1 mx-3">
                <Text
                  className="text-ink font-semibold text-sm"
                  numberOfLines={2}
                >
                  {item.title || "Cuộc trò chuyện mới"}
                </Text>
                <Text className="text-ink-muted text-xs mt-1">
                  {new Date(item.updated_at).toLocaleDateString("vi-VN")}
                  {item.status === "CLOSED" ? " · Đã đóng" : ""}
                </Text>
              </View>
              <Feather
                name={selectedId === item.id ? "check-circle" : "chevron-right"}
                size={17}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              disabled={deletingId !== null}
              accessibilityRole="button"
              accessibilityLabel={`Xóa cuộc trò chuyện ${item.title || "mới"}`}
              className="w-11 h-11 mr-2 items-center justify-center rounded-xl"
            >
              {deletingId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <Feather name="trash-2" size={18} color={COLORS.danger} />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          isFetching ? (
            <ActivityIndicator color={COLORS.primary} style={{ margin: 32 }} />
          ) : !isError ? (
            <EmptyState
              icon="message-circle"
              title="Chưa có cuộc trò chuyện. Hãy gửi câu hỏi đầu tiên cho trợ lý."
            />
          ) : null
        }
        ListFooterComponent={
          isError ? (
            <EmptyState
              icon="wifi-off"
              title="Không tải được lịch sử trò chuyện."
              actionLabel="Thử lại"
              onAction={() => {
                void refetch();
              }}
            />
          ) : currentData?.next ? (
            <TouchableOpacity
              disabled={isFetching || deletingId !== null}
              onPress={() => setPage((value) => value + 1)}
              className="items-center py-4"
              accessibilityRole="button"
            >
              {isFetching ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text className="text-primary font-semibold text-sm">
                  Xem thêm hội thoại
                </Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    </BottomSheet>
  );
}
