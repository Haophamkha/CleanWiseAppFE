import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { EmptyState } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useChatbot } from "../hooks/useChatbot";
import { useChatbotCardNavigation } from "../hooks/useChatbotCardNavigation";
import type { DisplayChatbotMessage } from "../types/chatbot";
import { ChatbotComposer } from "./ChatbotComposer";
import { ChatbotHistorySheet } from "./ChatbotHistorySheet";
import { ChatbotMessageBubble } from "./ChatbotMessageBubble";
import { ChatbotThinkingIndicator } from "./ChatbotThinkingIndicator";
import { ChatbotWelcome } from "./ChatbotWelcome";

function CustomerChatbot({ userId }: { userId: number }) {
  const chat = useChatbot(userId);
  const { openCard, opening } = useChatbotCardNavigation();
  const [historyVisible, setHistoryVisible] = useState(false);
  const list = useRef<FlatList<DisplayChatbotMessage>>(null);
  const lastMessage = chat.messages.at(-1);
  const lastMessageId = lastMessage?.id;
  const followLatest = useRef(true);
  const dragging = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToLatest = useCallback(() => {
    if (!followLatest.current || dragging.current || scrollTimer.current !== null) return;
    // Coalesce text/card layouts rather than restarting native scrolling for
    // every character. Offset zero is the bottom of this inverted list.
    scrollTimer.current = setTimeout(() => {
      scrollTimer.current = null;
      if (followLatest.current && !dragging.current)
        list.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    followLatest.current = true;
    dragging.current = false;
  }, [chat.conversation?.id]);
  useEffect(() => {
    if (lastMessage?.role === "user") followLatest.current = true;
    scrollToLatest();
  }, [lastMessageId, lastMessage?.role, chat.working, scrollToLatest]);
  useEffect(() => {
    return () => {
      if (scrollTimer.current !== null) clearTimeout(scrollTimer.current);
    };
  }, []);
  const unavailable = chat.working || chat.loading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TabScreenHeader
        title="Trợ lý CleanWise"
        subtitle="Tra cứu đơn, hướng dẫn đặt dịch vụ và thanh toán"
      >
        <View className="flex-row items-center mt-4" style={{ gap: 8 }}>
          <TouchableOpacity onPress={() => router.push("/help" as any)} accessibilityRole="button" accessibilityLabel="Mở hướng dẫn sử dụng" className="p-3 rounded-xl border border-line bg-surface">
            <Feather name="book-open" size={18} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setHistoryVisible(true);
            }}
            disabled={unavailable}
            accessibilityRole="button"
            accessibilityLabel="Xem lịch sử trò chuyện"
            className={`flex-row items-center bg-surface rounded-full px-3.5 py-2 border border-line ${unavailable ? "opacity-50" : ""}`}
          >
            <Feather name="clock" size={14} color={COLORS.primaryDark} />
            <Text className="text-primary-dark font-semibold text-xs ml-1.5">
              Lịch sử
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              chat.newConversation();
            }}
            disabled={unavailable}
            accessibilityRole="button"
            accessibilityLabel="Tạo cuộc trò chuyện mới"
            className={`flex-row items-center bg-primary rounded-full px-3.5 py-2 ${unavailable ? "opacity-50" : ""}`}
          >
            <Feather name="plus" size={14} color={COLORS.white} />
            <Text className="text-white font-semibold text-xs ml-1.5">
              Trò chuyện mới
            </Text>
          </TouchableOpacity>
        </View>
      </TabScreenHeader>

      {chat.loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text className="text-ink-soft text-sm mt-3">
            Đang tải cuộc trò chuyện...
          </Text>
        </View>
      ) : chat.loadError && !chat.messages.length ? (
        <View className="flex-1 justify-center">
          <EmptyState
            icon="wifi-off"
            title={chat.loadError}
            actionLabel="Thử lại"
            onAction={chat.reload}
          />
        </View>
      ) : !chat.messages.length ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 12 }}
        >
          <ChatbotWelcome
            onAsk={(text) => {
              void chat.send(text);
            }}
            disabled={unavailable || !!chat.pending}
          />
        </ScrollView>
      ) : (
        <FlatList
          ref={list}
          inverted
          maintainVisibleContentPosition={chat.revealingMessageId !== null ? undefined : { minIndexForVisible: 0 }}
          data={[...chat.messages].reverse()}
          onLayout={scrollToLatest}
          onContentSizeChange={scrollToLatest}
          onScrollBeginDrag={() => {
            dragging.current = true;
            followLatest.current = false;
          }}
          onScrollEndDrag={(event) => {
            dragging.current = false;
            followLatest.current = event.nativeEvent.contentOffset.y <= 48;
          }}
          onMomentumScrollEnd={(event) => {
            followLatest.current = event.nativeEvent.contentOffset.y <= 48;
          }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View
              onLayout={
                item.id === lastMessageId
                  ? () => {
                      scrollToLatest();
                    }
                  : undefined
              }
            >
              <ChatbotMessageBubble
                message={item}
                animate={item.id === chat.revealingMessageId}
                onRevealComplete={() => chat.finishReveal(item.id)}
                opening={opening}
                onOpenCard={(card) => {
                  void openCard(card);
                }}
              />
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 12,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            chat.working ? <ChatbotThinkingIndicator /> : null
          }
          ListFooterComponent={
            chat.hasOlder ? (
              <TouchableOpacity
                onPress={() => {
                  void chat.loadOlder();
                }}
                disabled={chat.loadingOlder}
                accessibilityRole="button"
                className="items-center py-3"
              >
                {chat.loadingOlder ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Text className="text-primary text-xs font-bold">
                    Xem tin nhắn cũ
                  </Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {chat.loadError && !!chat.messages.length && !chat.working && (
        <TouchableOpacity
          onPress={chat.reload}
          disabled={chat.working}
          className="bg-danger-light mx-4 mb-2 p-3 rounded-xl"
        >
          <Text className="text-danger text-xs">
            Không tải được tin nhắn. Chạm để thử lại.
          </Text>
        </TouchableOpacity>
      )}
      {chat.replyError && !chat.working && (
        <View
          accessibilityLiveRegion="polite"
          className="bg-danger-light border border-line rounded-2xl mx-4 mb-2 p-3"
        >
          <View className="flex-row items-start">
            <Feather
              name="alert-circle"
              size={15}
              color={COLORS.danger}
              style={{ marginTop: 2 }}
            />
            <Text className="text-ink-soft text-xs leading-5 flex-1 ml-2">
              {chat.replyError}
            </Text>
          </View>
          <View className="flex-row justify-end mt-2" style={{ gap: 16 }}>
            {chat.pending && (
              <TouchableOpacity
                onPress={chat.editQuestion}
                accessibilityRole="button"
                disabled={chat.working}
              >
                <Text className="text-ink-soft text-xs font-semibold">
                  Sửa câu hỏi
                </Text>
              </TouchableOpacity>
            )}
            {chat.conversation?.status !== "CLOSED" && (
              <TouchableOpacity
                onPress={chat.retry}
                accessibilityRole="button"
                disabled={chat.working}
              >
                <Text className="text-primary-dark text-xs font-bold">
                  Thử lại
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      <ChatbotComposer
        draft={chat.draft}
        onChange={chat.setDraft}
        onSend={() => {
          void chat.send();
        }}
        disabled={unavailable || !!chat.pending || !!chat.loadError}
        closed={chat.conversation?.status === "CLOSED"}
      />
      <ChatbotHistorySheet
        visible={historyVisible}
        userId={userId}
        selectedId={chat.conversation?.id}
        onClose={() => setHistoryVisible(false)}
        onSelect={(item) => {
          void chat.openConversation(item);
        }}
        onDeleted={(id) => {
          if (chat.conversation?.id === id) chat.newConversation();
        }}
      />
    </KeyboardAvoidingView>
  );
}

export function ChatbotScreen() {
  const userId = useAppSelector((state) => state.auth.user?.id);
  if (!userId)
    return (
      <View className="flex-1 bg-canvas">
        <TabScreenHeader
          title="Trợ lý CleanWise"
          subtitle="Dịch vụ và lịch của bạn, ngay trong cuộc trò chuyện"
        />
        <View className="flex-1 justify-center px-5">
          <RequireLoginNotice message="Đăng nhập để trò chuyện với trợ lý và tra cứu đơn hàng, lịch dịch vụ của bạn." />
        </View>
      </View>
    );
  // Remount on account changes so local transcript/draft cannot cross accounts.
  return <CustomerChatbot key={userId} userId={userId} />;
}
