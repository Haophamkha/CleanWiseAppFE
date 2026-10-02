import {
    chatApi,
    useGetConversationsQuery,
    useReadChatMessagesMutation,
} from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import type {
    ChatConversation,
    ConversationPage,
} from "@/features/chat/types/chat";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

export function useChatInbox() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [markRead] = useReadChatMessagesMutation();
  const readingRef = useRef(new Set<number>());
  const { data, isLoading, isFetching, isError, refetch } =
    useGetConversationsQuery(page, {
      skip: !user,
      refetchOnMountOrArgChange: 15,
    });

  useEffect(() => {
    if (!data) return;
    setItems((previous) => {
      if (page === 1) return data.results;
      const byId = new Map(previous.map((item) => [item.id, item]));
      data.results.forEach((item) => byId.set(item.id, item));
      return [...byId.values()];
    });
  }, [data, page]);

  useChatSocket(
    !!user,
    (event) => {
      if (
        event.type === "message.created" ||
        event.type === "messages.read" ||
        event.type === "conversation.updated"
      ) {
        setPage(1);
        refetch();
      }
    },
    refetch,
  );

  const refresh = async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (data?.next && !isFetching) setPage((value) => value + 1);
  };

  // Đánh dấu đã đọc ngay khi mở (cập nhật cache trước, gọi API sau)
  const readOnOpen = (item: ChatConversation) => {
    if (item.unread_count <= 0 || readingRef.current.has(item.id)) return;
    readingRef.current.add(item.id);
    setItems((previous) =>
      previous.map((conversation) =>
        conversation.id === item.id
          ? { ...conversation, unread_count: 0 }
          : conversation,
      ),
    );
    const updateUnread = (draft: ConversationPage) => {
      draft.total_unread = Math.max(0, draft.total_unread - item.unread_count);
      const conversation = draft.results.find((row) => row.id === item.id);
      if (conversation) conversation.unread_count = 0;
    };
    dispatch(chatApi.util.updateQueryData("getConversations", 1, updateUnread));
    if (page !== 1) {
      dispatch(
        chatApi.util.updateQueryData("getConversations", page, updateUnread),
      );
    }
    void markRead({ conversation_id: item.id })
      .unwrap()
      .catch(() => {
        void refetch();
      })
      .finally(() => {
        readingRef.current.delete(item.id);
      });
  };

  const openConversation = (item: ChatConversation) => {
    readOnOpen(item);
    router.push(`/messages/${item.id}`);
  };

  return {
    isLoggedIn: !!user,
    items,
    isInitialLoading: isLoading && !data,
    hasError: isError && !data,
    isLoadingMore: isFetching && page > 1,
    refreshing,
    refresh,
    loadMore,
    openConversation,
  };
}
