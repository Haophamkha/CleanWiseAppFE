import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  useCreateChatbotConversationMutation,
  useLazyGetChatbotConversationQuery,
  useLazyGetChatbotConversationsQuery,
  useLazyGetChatbotMessagesQuery,
  useLazyGetChatbotRunQuery,
  useSendChatbotMessageMutation,
} from "../api/chatbotApi";
import type {
  ChatbotConversation,
  ChatbotMessage,
  PendingChatbotMessage,
  DisplayChatbotMessage,
} from "../types/chatbot";
import {
  chatbotErrorMessage,
  mergeChatbotMessages,
  parsePendingMessage,
} from "../utils/chatbotUtils";

type Phase = "idle" | "sending" | "processing" | "failed";
const RECOVERY_WINDOW_MS = 180000;

export function useChatbot(userId: number) {
  const [listConversations] = useLazyGetChatbotConversationsQuery();
  const [getConversation] = useLazyGetChatbotConversationQuery();
  const [getMessages] = useLazyGetChatbotMessagesQuery();
  const [getRun] = useLazyGetChatbotRunQuery();
  const [createConversation] = useCreateChatbotConversationMutation();
  const [sendMessage] = useSendChatbotMessageMutation();
  const [conversation, setConversation] = useState<ChatbotConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [revealingMessageId, setRevealingMessageId] = useState<number | null>(null);
  const [pending, setPendingState] = useState<PendingChatbotMessage | null>(
    null,
  );
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderPage, setOlderPage] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  const alive = useRef(true);
  const generation = useRef(0);
  const busy = useRef(false);
  const refreshing = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const pendingRef = useRef<PendingChatbotMessage | null>(null);
  const dismissedMessageId = useRef<string | null>(null);
  const storageOperation = useRef<Promise<void>>(Promise.resolve());
  const storageKey = `cleanwise:chatbot:pending:${userId}`;

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    if (alive.current) setPhaseState(next);
  }, []);
  const setPending = useCallback((next: PendingChatbotMessage | null) => {
    pendingRef.current = next;
    if (alive.current) setPendingState(next);
  }, []);
  const clearPending = useCallback(() => {
    setPending(null);
    // Transcript is authoritative if local cleanup is interrupted.
    storageOperation.current = storageOperation.current
      .then(() => AsyncStorage.removeItem(storageKey))
      .catch(() => {});
    setPhase("idle");
    if (alive.current) setReplyError(null);
  }, [setPending, setPhase, storageKey]);

  const readLatest = useCallback(
    async (id: number) => {
      const first = await getMessages({ conversationId: id, page: 1 }).unwrap();
      const lastPage = Math.max(1, Math.ceil(first.count / 50));
      if (lastPage === 1) return { messages: first.results, olderPage: 0 };
      const last = await getMessages({
        conversationId: id,
        page: lastPage,
      }).unwrap();
      const previous =
        lastPage === 2
          ? first
          : await getMessages({
              conversationId: id,
              page: lastPage - 1,
            }).unwrap();
      return {
        messages: mergeChatbotMessages(previous.results, last.results),
        olderPage: lastPage - 2,
      };
    },
    [getMessages],
  );

  const reconcile = useCallback(
    (items: ChatbotMessage[], id: number) => {
      let record = pendingRef.current;
      const latestUser = [...items]
        .reverse()
        .find((item) => item.role === "user");
      if (
        !record &&
        latestUser?.client_message_id &&
        latestUser.status !== "COMPLETED" &&
        latestUser.client_message_id !== dismissedMessageId.current
      ) {
        record = {
          conversation_id: id,
          client_message_id: latestUser.client_message_id,
          text: latestUser.text,
          created_at: latestUser.created_at,
        };
        setPending(record);
      }
      if (!record || record.conversation_id !== id) return;
      const server = items.find(
        (item) => item.client_message_id === record.client_message_id,
      );
      if (server?.status === "COMPLETED") {
        const reply = items.find((item) => item.role === "assistant" && item.run_id === server.run_id);
        if (reply) setRevealingMessageId(reply.id);
        clearPending();
      } else if (
        server?.status === "PROCESSING" &&
        Date.now() -
          Math.max(
            Date.parse(server.created_at),
            Date.parse(record.created_at),
          ) <
          RECOVERY_WINDOW_MS
      ) {
        setPhase("processing");
        setReplyError(null);
      } else {
        setPhase("failed");
        setReplyError(
          (current) =>
            current ??
            "Câu hỏi chưa có câu trả lời. Bạn có thể thử lại hoặc sửa câu hỏi.",
        );
      }
    },
    [clearPending, setPending, setPhase],
  );

  const openConversation = useCallback(
    async (
      next: ChatbotConversation,
      restore?: PendingChatbotMessage | null,
    ) => {
      if (busy.current || phaseRef.current === "processing") return;
      const version = ++generation.current;
      dismissedMessageId.current = null;
      if (!restore) clearPending();
      setConversation(next);
      setMessages([]);
      setRevealingMessageId(null);
      setDraft("");
      setPending(restore ?? null);
      setPhase("idle");
      setReplyError(null);
      setLoadError(null);
      setOlderPage(0);
      setLoading(true);
      try {
        const latest = await readLatest(next.id);
        if (!alive.current || version !== generation.current) return;
        setMessages(latest.messages);
        setOlderPage(latest.olderPage);
        reconcile(latest.messages, next.id);
      } catch (error) {
        if (alive.current && version === generation.current)
          setLoadError(chatbotErrorMessage(error));
      } finally {
        if (alive.current && version === generation.current) setLoading(false);
      }
    },
    [clearPending, readLatest, reconcile, setPending, setPhase],
  );

  const initialize = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const stored = parsePendingMessage(
        await AsyncStorage.getItem(storageKey),
      );
      const page = await listConversations({ userId, page: 1 }).unwrap();
      if (!alive.current) return;
      let next = page.results.find(
        (item) => item.id === stored?.conversation_id,
      );
      if (!next && stored) {
        try {
          next = await getConversation(stored.conversation_id).unwrap();
        } catch {
          await AsyncStorage.removeItem(storageKey);
        }
      }
      next ??=
        page.results.find((item) => item.status === "ACTIVE") ??
        page.results[0];
      if (!alive.current) return;
      if (next)
        await openConversation(
          next,
          stored?.conversation_id === next.id ? stored : null,
        );
    } catch (error) {
      if (alive.current) setLoadError(chatbotErrorMessage(error));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [
    getConversation,
    listConversations,
    openConversation,
    storageKey,
    userId,
  ]);

  useEffect(() => {
    alive.current = true;
    void initialize();
    return () => {
      alive.current = false;
      generation.current += 1;
    };
  }, [initialize]);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setForeground(state === "active"),
    );
    return () => subscription.remove();
  }, []);

  const refresh = useCallback(async () => {
    if (!conversation || busy.current || refreshing.current) return;
    refreshing.current = true;
    const version = generation.current;
    try {
      const record = pendingRef.current;
      const server = messages.find(
        (item) => item.client_message_id === record?.client_message_id,
      );
      if (record && server?.run_id && phaseRef.current === "processing") {
        const result = await getRun(server.run_id).unwrap();
        if (!alive.current || version !== generation.current) return;
        if (
          result.run.status === "RUNNING" &&
          Date.now() - Date.parse(record.created_at) < RECOVERY_WINDOW_MS
        )
          return;
        if (result.run.status !== "RUNNING") {
          if (result.assistant_message) setRevealingMessageId(result.assistant_message.id);
          setMessages((current) =>
            mergeChatbotMessages(
              current,
              [result.user_message],
              result.assistant_message ? [result.assistant_message] : [],
            ),
          );
          if (result.run.status === "SUCCEEDED") clearPending();
          else {
            setPhase("failed");
            setReplyError(
              chatbotErrorMessage({
                data: { errors: { chatbot_error_code: result.run.error_code } },
              }),
            );
          }
          return;
        }
      }
      const latest = await readLatest(conversation.id);
      if (!alive.current || version !== generation.current) return;
      setMessages((current) => mergeChatbotMessages(current, latest.messages));
      reconcile(latest.messages, conversation.id);
      setLoadError(null);
    } catch (error) {
      if (!alive.current || version !== generation.current) return;
      if (pendingRef.current) {
        setPhase("failed");
        setReplyError(chatbotErrorMessage(error));
      } else setLoadError(chatbotErrorMessage(error));
    } finally {
      refreshing.current = false;
    }
  }, [
    clearPending,
    conversation,
    getRun,
    messages,
    readLatest,
    reconcile,
    setPhase,
  ]);

  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    if (!focused || !foreground || loading || !conversation) return;
    void refreshRef.current();
    if (phase !== "processing") return;
    const timer = setInterval(() => {
      void refreshRef.current();
    }, 4000);
    return () => clearInterval(timer);
  }, [focused, foreground, loading, conversation, phase]);

  const execute = useCallback(
    async (record: PendingChatbotMessage) => {
      storageOperation.current = storageOperation.current
        .catch(() => {})
        .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(record)));
      await storageOperation.current;
      setPending(record);
      setReplyError(null);
      setPhase("sending");
      const response = await sendMessage({
        conversationId: record.conversation_id,
        text: record.text,
        client_message_id: record.client_message_id,
      }).unwrap();
      if (!alive.current) return;
      if (response.assistant_message) setRevealingMessageId(response.assistant_message.id);
      setMessages((current) =>
        mergeChatbotMessages(
          current,
          [response.user_message],
          response.assistant_message ? [response.assistant_message] : [],
        ),
      );
      setConversation((current) =>
        current
          ? { ...current, title: current.title || record.text.slice(0, 160) }
          : current,
      );
      clearPending();
    },
    [clearPending, sendMessage, setPending, setPhase, storageKey],
  );

  const send = useCallback(
    async (text = draft, retry?: PendingChatbotMessage) => {
      const value = text.trim();
      if (
        !value ||
        value.length > 2000 ||
        busy.current ||
        loading ||
        phaseRef.current === "processing" ||
        (!retry && pendingRef.current) ||
        conversation?.status === "CLOSED"
      )
        return;
      busy.current = true;
      // Ignore history/foreground reads started before this new attempt.
      generation.current += 1;
      setPhase("sending");
      setReplyError(null);
      setLoadError(null);
      try {
        const target = conversation ?? (await createConversation().unwrap());
        if (!alive.current) return;
        setConversation(target);
        const record = retry
          ? { ...retry, created_at: new Date().toISOString() }
          : {
              conversation_id: target.id,
              text: value,
              client_message_id: Crypto.randomUUID(),
              created_at: new Date().toISOString(),
            };
        setPending(record);
        setDraft("");
        await execute(record);
      } catch (error) {
        if (!alive.current) return;
        const record = pendingRef.current;
        if (record) {
          setPhase("processing");
          setReplyError(null);
          try {
            const latest = await readLatest(record.conversation_id);
            if (!alive.current) return;
            setMessages((current) =>
              mergeChatbotMessages(current, latest.messages),
            );
            const server = latest.messages.find(
              (item) => item.client_message_id === record.client_message_id,
            );
            if (server?.status === "COMPLETED") reconcile(latest.messages, record.conversation_id);
            else if (server?.status === "PROCESSING")
              reconcile(latest.messages, record.conversation_id);
            else {
              setPhase("failed");
              setReplyError(chatbotErrorMessage(error));
            }
          } catch {
            // Keep the durable UUID for manual retry after reconnection.
            setPhase("failed");
            if (alive.current) setReplyError(chatbotErrorMessage(error));
          }
        } else {
          setPhase("failed");
          setReplyError(chatbotErrorMessage(error));
        }
      } finally {
        busy.current = false;
      }
    },
    [
      clearPending,
      conversation,
      createConversation,
      draft,
      execute,
      loading,
      readLatest,
      reconcile,
      setPending,
      setPhase,
    ],
  );

  const loadOlder = useCallback(async () => {
    if (!conversation || !olderPage || loadingOlder) return;
    const version = generation.current;
    setLoadingOlder(true);
    try {
      const page = await getMessages({
        conversationId: conversation.id,
        page: olderPage,
      }).unwrap();
      if (!alive.current || version !== generation.current) return;
      setMessages((current) => mergeChatbotMessages(page.results, current));
      setOlderPage(olderPage - 1);
    } catch (error) {
      if (alive.current && version === generation.current)
        setLoadError(chatbotErrorMessage(error));
    } finally {
      if (alive.current) setLoadingOlder(false);
    }
  }, [conversation, getMessages, loadingOlder, olderPage]);

  const newConversation = useCallback(() => {
    if (busy.current || loading || phaseRef.current === "processing") return;
    generation.current += 1;
    clearPending();
    setConversation(null);
    setMessages([]);
    setRevealingMessageId(null);
    setDraft("");
    setOlderPage(0);
    setLoading(false);
    setLoadError(null);
  }, [clearPending, loading]);

  const working = phase === "sending" || phase === "processing";
  const displayMessages: DisplayChatbotMessage[] = messages.map((message) =>
    working &&
    pending &&
    message.role === "user" &&
    message.client_message_id === pending.client_message_id
      ? { ...message, status: "PROCESSING" }
      : message,
  );
  if (
    pending &&
    !messages.some(
      (item) => item.client_message_id === pending.client_message_id,
    )
  ) {
    displayMessages.push({
      id: `local:${pending.client_message_id}`,
      role: "user",
      text: pending.text,
      cards: [],
      status: phase === "failed" ? "FAILED" : "PROCESSING",
      client_message_id: pending.client_message_id,
      run_id: null,
      created_at: pending.created_at,
    });
  }

  return {
    conversation,
    messages: displayMessages,
    revealingMessageId,
    finishReveal: (id: number | string) => setRevealingMessageId((current) => current === id ? null : current),
    draft,
    setDraft,
    loading,
    loadError,
    replyError,
    phase,
    pending,
    working,
    loadingOlder,
    hasOlder: olderPage > 0,
    send,
    loadOlder,
    newConversation,
    openConversation,
    reload: () =>
      conversation
        ? void openConversation(conversation, pendingRef.current)
        : void initialize(),
    retry: () => (pending ? void send(pending.text, pending) : void send()),
    editQuestion: () => {
      const text = pending?.text;
      dismissedMessageId.current = pending?.client_message_id ?? null;
      clearPending();
      if (text) setDraft(text);
    },
  };
}
