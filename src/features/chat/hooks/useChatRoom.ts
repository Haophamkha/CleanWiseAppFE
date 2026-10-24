import { useTranslation } from "react-i18next";
import { getLocale } from "@/features/language/i18n";
import type { ChatModerationStatus } from "@/features/chat/types/chat";
import {
    useGetConversationQuery,
    useListChatMessagesMutation,
    useReadChatMessagesMutation,
    useSendChatMessageMutation,
} from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import {
    getChatBlockedMessage,
    getChatModerationStatus,
    restoreBlockedDraft,
} from "@/features/chat/utils/chatModeration";
import {
    mergeMessages,
    type UiChatMessage,
} from "@/features/chat/utils/chatUtils";
import { useAppSelector } from "@/store/hooks";
import { showErrorToast } from "@/utils/toast";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, FlatList, Keyboard, Platform } from "react-native";

export function useChatRoom(id: number) {
  const { t } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError, refetch } = useGetConversationQuery(id, {
    skip: !Number.isFinite(id),
  });
  const [listMessages, { isLoading: loadingMessages }] =
    useListChatMessagesMutation();
  const [sendMessage] = useSendChatMessageMutation();
  const [markRead] = useReadChatMessagesMutation();

  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [draft, setDraft] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(
    null,
  );

  const draftRef = useRef("");
  const list = useRef<FlatList<UiChatMessage>>(null);
  const scrollToLatestRef = useRef(true);
  const nearLatestRef = useRef(true);
  const focusedRef = useRef(false);
  const typingActiveRef = useRef(false);
  const lastTypingSentRef = useRef(0);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localSequence = useRef(0);
  const inFlight = useRef(new Set<number>());
  const requestKeys = useRef(new Map<number, string>());

  const [localModeration, setLocalModeration] = useState<ChatModerationStatus | null>(null);
  const conversation = data?.conversation;
  const moderation = localModeration ?? conversation?.moderation;
  const canSend = !!conversation?.can_send && !moderation?.is_locked;
  const restrictionNotice = moderation?.is_locked && moderation.locked_until
    ? t("Bạn bị tạm khóa gửi chat đến {{value0}}. Bạn vẫn có thể đọc, nhận tin và liên hệ hỗ trợ.", { value0: new Date(moderation.locked_until).toLocaleString(getLocale()) })
    : undefined;
  const moderationNotice = !moderation?.is_locked && moderation?.violation_count
    ? t("Bạn đã vi phạm {{value0}} lần trong {{value1}} ngày. Không chia sẻ SĐT, email hoặc liên kết ngoài ứng dụng.", { value0: moderation.violation_count, value1: moderation.window_days })
    : undefined;

  useEffect(() => { setLocalModeration(null); }, [data]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refetch();
    });
    return () => subscription.remove();
  }, [refetch]);
  useEffect(() => {
    if (!moderation?.locked_until) return;
    const delay = Math.max(1000, new Date(moderation.locked_until).getTime() - Date.now() + 500);
    const timer = setTimeout(() => { refetch(); }, Math.min(delay, 2147483647));
    return () => clearTimeout(timer);
  }, [moderation?.locked_until, refetch]);
  const displayMessages = useMemo(() => [...messages].reverse(), [messages, t]);
  const latestSentId = displayMessages.find(
    (message) =>
      message.message_type !== "SYSTEM" && message.sender_id === user?.id,
  )?.id;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const scrollToLatest = useCallback((animated = false) => {
    nearLatestRef.current = true;
    scrollToLatestRef.current = true;
    requestAnimationFrame(() =>
      list.current?.scrollToOffset({ offset: 0, animated }),
    );
  }, [t]);

  const reload = useCallback(async () => {
    try {
      const page = await listMessages({
        conversation_id: id,
        limit: 30,
      }).unwrap();
      setMessages((previous) => mergeMessages(previous, page.results));
      setCursor(page.next_cursor);
      setLoaded(true);
      setMessageError(false);
    } catch {
      setLoaded(true);
      setMessageError(true);
    }
  }, [id, listMessages, t]);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      markRead({ conversation_id: id });
      scrollToLatest();
      refetch();
      reload();
      return () => {
        focusedRef.current = false;
      };
    }, [id, markRead, refetch, reload, scrollToLatest, t]),
  );

  const { sendTyping } = useChatSocket(
    !!user && Number.isFinite(id),
    (event) => {
      if (event.type === "moderation.updated" || (event.type === "conversation.updated" && event.conversation_id === id)) {
        refetch();
        return;
      }
      if (
        event.type === "message.created" &&
        event.message?.conversation_id === id
      ) {
        setMessages((previous) => mergeMessages(previous, [event.message!]));
        if (focusedRef.current && nearLatestRef.current) scrollToLatest(true);
        if (focusedRef.current && event.message.sender_id !== user?.id) {
          markRead({ conversation_id: id });
        }
      } else if (
        event.type === "messages.read" &&
        event.conversation_id === id
      ) {
        setMessages((previous) =>
          previous.map((message) =>
            message.sender_id === user?.id
              ? { ...message, is_read: true }
              : message,
          ),
        );
      } else if (
        event.type === "typing.changed" &&
        event.conversation_id === id &&
        event.user_id !== user?.id
      ) {
        if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
        setOtherTyping(!!event.is_typing);
        if (event.is_typing) {
          otherTypingTimer.current = setTimeout(
            () => setOtherTyping(false),
            5000,
          );
        }
      }
    },
    () => {
      refetch();
      reload();
      if (focusedRef.current) markRead({ conversation_id: id });
    },
  );

  const stopTyping = useCallback(() => {
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = null;
    if (typingActiveRef.current) sendTyping(id, false);
    typingActiveRef.current = false;
    lastTypingSentRef.current = 0;
  }, [id, sendTyping, t]);

  const updateDraft = (value: string) => {
    draftRef.current = value;
    setDraft(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (!typingActiveRef.current || now - lastTypingSentRef.current > 2000) {
      sendTyping(id, true);
      typingActiveRef.current = true;
      lastTypingSentRef.current = now;
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(stopTyping, 2200);
  };

  useEffect(
    () => () => {
      stopTyping();
      if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
    },
    [stopTyping],
  );

  useFocusEffect(useCallback(() => () => stopTyping(), [stopTyping, t]));

  const loadOlder = async () => {
    if (!cursor || loadingMessages) return;
    try {
      const page = await listMessages({
        conversation_id: id,
        cursor,
        limit: 30,
      }).unwrap();
      scrollToLatestRef.current = false;
      setMessages((previous) => mergeMessages(previous, page.results));
      setCursor(page.next_cursor);
    } catch {
      Alert.alert(t("Lỗi"), t("Không tải được tin nhắn cũ."));
    }
  };

  const submit = async (text: string, retryId?: number) => {
    if (!text || !canSend || !user?.id) return;
    stopTyping();
    const localId =
      retryId ?? Date.now() * 1000 + (++localSequence.current % 1000);
    if (inFlight.current.has(localId)) return;
    inFlight.current.add(localId);
    const clientMessageId = requestKeys.current.get(localId) ?? `${user.id}_${id}_${localId}_${Math.random().toString(36).slice(2)}`;
    requestKeys.current.set(localId, clientMessageId);
    if (retryId) {
      setMessages((previous) =>
        previous.map((item) =>
          item.id === localId ? { ...item, localStatus: "sending" } : item,
        ),
      );
    } else {
      const optimistic: UiChatMessage = {
        id: localId,
        conversation_id: id,
        sender_id: user.id,
        recipient_id: null,
        related_assignment_id: null,
        message: text,
        message_type: "TEXT",
        attachment: null,
        is_read: false,
        created_at: new Date().toISOString(),
        localStatus: "sending",
        client_message_id: clientMessageId,
      };
      setMessages((previous) => [...previous, optimistic]);
      draftRef.current = "";
      setDraft("");
    }
    scrollToLatest(true);
    try {
      const saved = await sendMessage({
        conversation_id: id,
        message: text,
        client_message_id: clientMessageId,
      }).unwrap();
      setMessages((previous) =>
        mergeMessages(
          previous.filter((item) => item.id !== localId),
          [saved],
        ),
      );
      requestKeys.current.delete(localId);
      if (saved.moderation) {
        setLocalModeration(saved.moderation);
        Alert.alert(t("Cảnh báo chat"), saved.moderation.message);
      }
      scrollToLatest();
    } catch (error) {
      const blockedMessage = getChatBlockedMessage(error);
      if (blockedMessage) {
        requestKeys.current.delete(localId);
        const status = getChatModerationStatus(error);
        if (status) setLocalModeration(status);
        refetch();
        setMessages((previous) => previous.filter((item) => item.id !== localId));
        draftRef.current = restoreBlockedDraft(text, draftRef.current);
        setDraft(draftRef.current);
        showErrorToast(t("Không thể gửi tin nhắn"), blockedMessage);
        return;
      }
      setMessages((previous) =>
        previous.map((item) =>
          item.id === localId ? { ...item, localStatus: "failed" } : item,
        ),
      );
      refetch();
    } finally {
      inFlight.current.delete(localId);
    }
  };

  const onScroll = (offsetY: number) => {
    nearLatestRef.current = offsetY < 80;
    if (!nearLatestRef.current) scrollToLatestRef.current = false;
  };

  const onContentSizeChange = () => {
    if (scrollToLatestRef.current && messages.length > 0) {
      list.current?.scrollToOffset({ offset: 0, animated: false });
      scrollToLatestRef.current = false;
    }
  };

  return {
    user,
    conversation,
    restrictionNotice,
    moderationNotice,
    canSend,
    assignments: data?.assignments ?? [],
    isInitialLoading: isLoading && !data,
    hasError: isError || !conversation,
    list,
    displayMessages,
    latestSentId,
    expandedMessageId,
    toggleExpanded: (messageId: number) =>
      setExpandedMessageId((current) =>
        current === messageId ? null : messageId,
      ),
    hasOlder: !!cursor,
    loadingOlder: loadingMessages,
    loadOlder,
    loaded,
    messageError,
    reload,
    otherTyping,
    keyboardVisible,
    draft,
    updateDraft,
    stopTyping,
    sendDraft: () => submit(draftRef.current.trim()),
    retry: (item: UiChatMessage) => submit(item.message, item.id),
    onScroll,
    onContentSizeChange,
  };
}
