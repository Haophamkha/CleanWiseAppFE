const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { create, act } = require("react-test-renderer");

global.IS_REACT_ACT_ENVIRONMENT = true;
global.requestAnimationFrame = (callback) => callback();
const workspace = path.resolve(__dirname, "../../..");

function loadSource(project, relative, mocks = {}) {
  const filename = path.join(workspace, project, relative);
  const loaded = new Module(filename, module);
  loaded.paths = module.paths;
  loaded.require = (name) => Object.hasOwn(mocks, name) ? mocks[name] : name === "@/features/language/i18n" ? require("./language-support.cjs").language : name === "react-i18next" ? require("./language-support.cjs").react : require(name);
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  loaded._compile(result.outputText, filename);
  return loaded.exports;
}

const blockedError = {
  status: 400,
  data: { error_code: "CHAT_CONTENT_BLOCKED", message: "Tin nhắn chứa số điện thoại." },
};

for (const project of ["CleanWiseAppFE", "CleanWiseStaffFE"]) {
  const moderation = loadSource(project, "src/features/chat/utils/chatModeration.ts");
  test(`${project}: recognizes only content blocking errors`, () => {
    assert.equal(moderation.getChatBlockedMessage(blockedError), blockedError.data.message);
    for (const value of [null, {}, new Error("offline"), { data: { error_code: "FORBIDDEN" } }]) {
      assert.equal(moderation.getChatBlockedMessage(value), null);
    }
    assert.equal(moderation.restoreBlockedDraft("blocked", "new draft"), "blocked\nnew draft");
  });

  async function mount(send, overrides = {}) {
    let onEvent;
    const conversationData = { conversation: { id: 12, can_send: true, ...overrides }, assignments: [] };
    let state;
    const toasts = [];
    const refetch = () => {};
    const sendTyping = () => {};
    const markRead = () => {};
    const listMessages = () => ({ unwrap: async () => ({ results: [], next_cursor: null }) });
    const { useChatRoom } = loadSource(project, "src/features/chat/hooks/useChatRoom.ts", {
      "@/features/chat/api/chatApi": {
        useGetConversationQuery: () => ({ data: conversationData, refetch }),
        useListChatMessagesMutation: () => [listMessages, { isLoading: false }],
        useSendChatMessageMutation: () => [send],
        useReadChatMessagesMutation: () => [markRead],
      },
      "@/features/chat/hooks/useChatSocket": { useChatSocket: (_enabled, callback) => { onEvent = callback; return { sendTyping }; } },
      "@/features/chat/utils/chatUtils": loadSource("CleanWiseAppFE", "src/features/chat/utils/chatUtils.ts"),
      "@/features/chat/utils/chatModeration": moderation,
      "@/store/hooks": { useAppSelector: () => ({ id: 1 }) },
      "@/utils/toast": { showErrorToast: (...args) => toasts.push(args) },
      "expo-router": { useFocusEffect: () => {}, router: { back: () => {} } },
      "react-native": {
        AppState: { addEventListener: () => ({ remove: () => {} }) },
        Alert: { alert: (...args) => toasts.push(args) }, Platform: { OS: "web" },
        Keyboard: { addListener: () => ({ remove: () => {} }) },
      },
      "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    });
    function Harness() { state = useChatRoom(12); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Harness)); });
    return { get state() { return state; }, emit: (event) => onEvent(event), toasts, renderer };
  }

  test(`${project}: blocked send restores draft, removes pending bubble and shows reason`, async () => {
    let reject;
    const request = new Promise((_, fail) => { reject = fail; });
    const harness = await mount(() => ({ unwrap: () => request }));
    try {
      await act(async () => { harness.state.updateDraft("Gọi 0912345678"); });
      let sending;
      await act(async () => { sending = harness.state.sendDraft(); });
      assert.equal(harness.state.draft, "");
      await act(async () => { harness.state.updateDraft("Nội dung mới đang nhập"); });
      await act(async () => { reject(blockedError); await sending; });
      assert.equal(harness.state.draft, "Gọi 0912345678\nNội dung mới đang nhập");
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 0);
      assert.deepEqual(harness.toasts, [["Không thể gửi tin nhắn", blockedError.data.message]]);
    } finally {
      await act(async () => { harness.renderer.unmount(); });
    }
  });

  test(`${project}: ordinary network failure remains retryable`, async () => {
    const harness = await mount(() => ({ unwrap: async () => { throw { isNetworkError: true }; } }));
    try {
      await act(async () => { harness.state.updateDraft("Em đến lúc 9h nhé"); });
      await act(async () => { await harness.state.sendDraft(); });
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 1);
      assert.ok(messages[0].localStatus === "failed" || messages[0].failed);
      assert.equal(harness.toasts.length, 0);
    } finally {
      await act(async () => { harness.renderer.unmount(); });
    }
  });

  test(`${project}: accepted send keeps a saved bubble and no warning`, async () => {
    const text = "Em đến lúc 9h nhé";
    const saved = {
      id: 123, conversation_id: 12, sender_id: 1, message: text,
      message_type: "TEXT", is_read: false, created_at: new Date().toISOString(),
    };
    const harness = await mount(() => ({ unwrap: async () => saved }));
    try {
      await act(async () => { harness.state.updateDraft(text); });
      await act(async () => { await harness.state.sendDraft(); });
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 1);
      assert.equal(messages[0].id, saved.id);
      assert.equal(harness.state.draft, "");
      assert.equal(harness.toasts.length, 0);
    } finally {
      await act(async () => { harness.renderer.unmount(); });
    }
  });

  test(`${project}: redacted success shows warning and only saved safe content`, async () => {
    const status = { message: "Thông tin liên hệ đã được ẩn", violation_count: 1, warning_limit: 3, window_days: 30, is_locked: false, locked_until: null };
    const saved = { id: 123, sender_id: 1, message_type: "TEXT", message: "Gọi [SĐT đã ẩn]", created_at: new Date().toISOString(), moderation: status };
    const harness = await mount(() => ({ unwrap: async () => saved }));
    try {
      await act(async () => { harness.state.updateDraft("Gọi 0912345678"); });
      await act(async () => { await harness.state.sendDraft(); });
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 1);
      assert.equal(messages[0].message ?? messages[0].text, saved.message);
      assert.match(harness.state.moderationNotice, /1 lần/);
      assert.equal(harness.toasts[0][0], "Cảnh báo chat");
    } finally { await act(async () => { harness.renderer.unmount(); }); }
  });

  test(`${project}: lock response removes pending message and disables sending`, async () => {
    const until = new Date(Date.now() + 86400000).toISOString();
    const error = { data: { error_code: "CHAT_SEND_LOCKED", message: "Tạm khóa chat", errors: {
      is_locked: true, locked_until: until, violation_count: 4, warning_limit: 3, window_days: 30,
    } } };
    let sends = 0;
    const harness = await mount(() => { sends++; return { unwrap: async () => { throw error; } }; });
    try {
      await act(async () => { harness.state.updateDraft("Gọi 0912345678"); });
      await act(async () => { await harness.state.sendDraft(); });
      assert.equal(harness.state.canSend, false);
      assert.match(harness.state.restrictionNotice, /tạm khóa gửi chat đến/);
      await act(async () => { await harness.state.sendDraft(); });
      assert.equal(sends, 1);
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 0);
    } finally { await act(async () => { harness.renderer.unmount(); }); }
  });

  test(`${project}: network retry reuses the original send identifier`, async () => {
    const calls = [];
    const text = "Em đến 9h30";
    const harness = await mount((data) => {
      calls.push(data);
      return { unwrap: async () => {
        if (calls.length === 1) throw { isNetworkError: true };
        return { id: 123, sender_id: 1, message_type: "TEXT", message: text, created_at: new Date().toISOString() };
      } };
    });
    try {
      await act(async () => { harness.state.updateDraft(text); });
      await act(async () => { await harness.state.sendDraft(); });
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      await act(async () => {
        if (harness.state.retry) await harness.state.retry(messages[0]);
        else await harness.state.retryMessage(messages[0].id, text);
      });
      assert.equal(calls.length, 2);
      assert.ok(calls[0].client_message_id);
      assert.equal(calls[0].client_message_id, calls[1].client_message_id);
    } finally { await act(async () => { harness.renderer.unmount(); }); }
  });

  test(`${project}: socket redaction replaces pending text even when HTTP response is lost`, async () => {
    let reject, sent;
    const pending = new Promise((_, fail) => { reject = fail; });
    const harness = await mount((data) => { sent = data; return { unwrap: () => pending }; });
    try {
      await act(async () => { harness.state.updateDraft("Gọi 0912345678"); });
      let sending;
      await act(async () => { sending = harness.state.sendDraft(); });
      await act(async () => { harness.emit({ type: "message.created", message: {
        id: 123, conversation_id: 12, sender_id: 1, message_type: "TEXT", message: "Gọi [SĐT đã ẩn]",
        created_at: new Date().toISOString(), client_message_id: sent.client_message_id,
      } }); });
      await act(async () => { reject({ isNetworkError: true }); await sending; });
      const messages = harness.state.displayMessages ?? harness.state.items.filter((item) => item.kind === "message");
      assert.equal(messages.length, 1);
      assert.equal(messages[0].message ?? messages[0].text, "Gọi [SĐT đã ẩn]");
    } finally { await act(async () => { harness.renderer.unmount(); }); }
  });

}
