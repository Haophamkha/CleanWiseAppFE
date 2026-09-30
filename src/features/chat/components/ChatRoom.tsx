import { EmptyState } from "@/components/ui";
import { CHAT_BG, COLORS } from "@/constants/theme";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatRoomHeader } from "@/features/chat/components/ChatRoomHeader";
import { MessageBubble, hhmm } from "@/features/chat/components/MessageBubble";
import { SystemMessageCard } from "@/features/chat/components/SystemMessageCard";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { useChatRoom } from "@/features/chat/hooks/useChatRoom";
import type { UiChatMessage } from "@/features/chat/utils/chatUtils";
import { router } from "expo-router";
import type { ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function dayLabel(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const t = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `${t} Hôm nay`;
  if (d.toDateString() === yest.toDateString()) return `${t} Hôm qua`;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${t} ${dd}/${mm}/${d.getFullYear()}`;
}

function DaySeparator({ iso }: { iso?: string | null }) {
  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 12,
          backgroundColor: "rgba(100,110,120,0.45)",
        }}
      >
        <Text style={{ fontSize: 12, color: "#fff" }}>{dayLabel(iso)}</Text>
      </View>
    </View>
  );
}

export function ChatRoom({ id }: { id: number; assignmentId?: number }) {
  const insets = useSafeAreaInsets();
  const r = useChatRoom(id);
  const bottomPadding = r.keyboardVisible ? 4 : Math.max(insets.bottom, 6);

  if (r.isInitialLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: CHAT_BG,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (r.hasError || !r.conversation) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: CHAT_BG }}
      >
        <EmptyState
          icon="alert-circle"
          title="Không mở được cuộc trò chuyện"
          actionLabel="Quay lại"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const conversation = r.conversation;

  const renderMessage = ({
    item,
    index,
  }: {
    item: UiChatMessage;
    index: number;
  }) => {
    // list inverted: index - 1 = tin mới hơn, index + 1 = tin cũ hơn
    const newer = r.displayMessages[index - 1];
    const older = r.displayMessages[index + 1];

    const showDay =
      !older ||
      new Date(older.created_at).toDateString() !==
        new Date(item.created_at).toDateString();

    let content: ReactNode;

    if (item.message_type === "SYSTEM") {
      const assignment = r.assignments.find(
        (a) => a.assignment_id === item.related_assignment_id,
      );
      content = <SystemMessageCard message={item} assignment={assignment} />;
    } else {
      const mine = item.sender_id === r.user?.id;
      const showAvatar =
        !newer ||
        newer.message_type === "SYSTEM" ||
        newer.sender_id !== item.sender_id;
      const sameAsOlder =
        older?.message_type !== "SYSTEM" && older?.sender_id === item.sender_id;

      // Giờ chỉ hiện ở tin cuối của nhóm (cùng người gửi, cùng phút)
      const showTime =
        !newer ||
        newer.message_type === "SYSTEM" ||
        newer.sender_id !== item.sender_id ||
        hhmm(newer.created_at) !== hhmm(item.created_at);

      const showMetadata =
        !!item.localStatus ||
        (mine && item.id === r.latestSentId) ||
        item.id === r.expandedMessageId;

      content = (
        <MessageBubble
          item={item}
          mine={mine}
          showAvatar={showAvatar}
          sameAsOlder={sameAsOlder}
          showTime={showTime}
          showMetadata={showMetadata}
          otherAvatar={conversation.other_user.avatar}
          myAvatar={r.user?.avatar}
          onToggle={() => r.toggleExpanded(item.id)}
          onRetry={() => r.retry(item)}
        />
      );
    }

    return (
      <View>
        {showDay && <DaySeparator iso={item.created_at} />}
        {content}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: CHAT_BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ChatRoomHeader
        name={conversation.other_user.name}
        avatar={conversation.other_user.avatar}
      />

      <View style={{ flex: 1, backgroundColor: CHAT_BG }}>
        <FlatList
          ref={r.list}
          inverted
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          data={r.displayMessages}
          extraData={`${r.expandedMessageId}:${r.latestSentId}:${r.user?.id}`}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          onScroll={(event) => r.onScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 8,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            r.otherTyping ? (
              <TypingIndicator avatar={conversation.other_user.avatar} />
            ) : null
          }
          ListFooterComponent={
            r.hasOlder ? (
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={r.loadOlder}
                  disabled={r.loadingOlder}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.85)",
                  }}
                >
                  {r.loadingOlder && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.primary,
                    }}
                  >
                    {r.loadingOlder ? "Đang tải..." : "Xem tin nhắn cũ"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListEmptyComponent={
            r.loaded ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  paddingHorizontal: 32,
                }}
              >
                <EmptyState
                  icon="message-circle"
                  title={
                    r.messageError
                      ? "Không tải được tin nhắn"
                      : "Chưa có tin nhắn. Hãy gửi lời chào để bắt đầu trò chuyện!"
                  }
                  actionLabel={r.messageError ? "Thử lại" : undefined}
                  onAction={r.messageError ? r.reload : undefined}
                />
              </View>
            ) : (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 24 }}
              />
            )
          }
          onContentSizeChange={r.onContentSizeChange}
        />
      </View>

      <ChatComposer
        canSend={conversation.can_send}
        draft={r.draft}
        onChange={r.updateDraft}
        onBlur={r.stopTyping}
        onSend={r.sendDraft}
        bottomPadding={bottomPadding}
      />
    </KeyboardAvoidingView>
  );
}
