import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/store/baseApi";
import { storage } from "@/utils/storage";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export type ChatSocketEvent = {
  type: string;
  conversation_id?: number;
  message?: import("@/features/chat/types/chat").ChatMessage;
  user_id?: number;
  is_typing?: boolean;
  unread_count?: number;
};

type Sub = {
  onEvent: { current: (event: ChatSocketEvent) => void };
  onReconnect: { current: (() => void) | undefined };
};

/* ── Một socket duy nhất cho cả app, chia sẻ giữa mọi nơi gọi useChatSocket ── */

const subs = new Set<Sub>();
let socket: WebSocket | null = null;
let authenticated = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let attempts = 0;
let wasConnected = false;
let connecting = false;
let running = false;
let appStateSub: { remove: () => void } | null = null;

async function connect() {
  if (!running || connecting || socket?.readyState === WebSocket.OPEN) return;
  connecting = true;
  const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!running || !token) {
    connecting = false;
    return;
  }
  const url =
    ENV.API_URL.replace(/^http/, "ws").replace(/\/$/, "") + "/ws/chat/";
  const connection = new WebSocket(url);
  socket = connection;
  authenticated = false;

  connection.onopen = () => {
    connecting = false;
    connection.send(JSON.stringify({ type: "auth", access_token: token }));
  };

  connection.onmessage = (raw) => {
    try {
      const event = JSON.parse(raw.data) as ChatSocketEvent;
      if (event.type === "auth.ok") {
        authenticated = true;
        attempts = 0;
        if (wasConnected) subs.forEach((s) => s.onReconnect.current?.());
        wasConnected = true;
      } else {
        subs.forEach((s) => s.onEvent.current(event));
      }
    } catch {
      // Bỏ qua frame lỗi từ server.
    }
  };

  connection.onclose = (e) => {
    authenticated = false;
    if (socket === connection) socket = null;
    connecting = false;
    if (!running) return;
    retryTimer = setTimeout(
      async () => {
        if (e.code === 4401) {
          try {
            await refreshAccessToken();
          } catch {
            return;
          }
        }
        connect();
      },
      Math.min(1000 * 2 ** attempts++, 15000),
    );
  };

  connection.onerror = () => connection.close();
}

function start() {
  running = true;
  appStateSub = AppState.addEventListener("change", (state) => {
    if (
      state === "active" &&
      running &&
      !connecting &&
      (!socket || socket.readyState === WebSocket.CLOSED)
    ) {
      if (retryTimer) clearTimeout(retryTimer);
      connect();
    }
  });
  connect();
}

function stop() {
  running = false;
  appStateSub?.remove();
  appStateSub = null;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  authenticated = false;
  attempts = 0;
  wasConnected = false;
  connecting = false;
  const s = socket;
  socket = null;
  s?.close();
}

const sendTyping = (conversationId: number, isTyping: boolean) => {
  if (authenticated && socket?.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: isTyping ? "typing.start" : "typing.stop",
        conversation_id: conversationId,
      }),
    );
  }
};

export function useChatSocket(
  enabled: boolean,
  onEvent: (event: ChatSocketEvent) => void,
  onReconnect?: () => void,
) {
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);
  onEventRef.current = onEvent;
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    if (!enabled) return;
    const sub: Sub = { onEvent: onEventRef, onReconnect: onReconnectRef };
    subs.add(sub);
    if (subs.size === 1) start();
    return () => {
      subs.delete(sub);
      if (subs.size === 0) stop();
    };
  }, [enabled]);

  return { sendTyping };
}
