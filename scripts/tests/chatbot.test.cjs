const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { create, act } = require("react-test-renderer");

global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, "../..");
const tick = () => new Promise((resolve) => setImmediate(resolve));
const dispatchStub = () => {};

// Transpile only the feature under test. Native storage/navigation/network are
// adapters; React still renders the actual hook and runs its effects normally.
function loadSource(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const loaded = new Module(filename, module);
  loaded.paths = module.paths;
  loaded.require = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "@/features/language/i18n") return require("./language-support.cjs").language;
    if (name === "react-i18next") return require("./language-support.cjs").react;
    if (name === "@/store/baseApi") return { baseApi: { util: { invalidateTags: (tags) => ({ type: "invalidate", payload: tags }) } } };
    if (name === "@/store/hooks") return { useAppDispatch: () => dispatchStub };
    if (name === "@/features/theme/ThemeProvider") return { useAppTheme: () => ({ COLORS: mocks["@/constants/theme"]?.COLORS ?? { primary: "green" } }) };
    if (name.startsWith(".")) {
      const absolute = path.resolve(path.dirname(filename), name);
      const target = [absolute, `${absolute}.ts`, `${absolute}.tsx`, `${absolute}.js`].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
      if (target?.endsWith(".ts") || target?.endsWith(".tsx")) return loadSource(path.relative(root, target), mocks);
      if (target) return require(target);
    }
    return require(name);
  };
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  loaded._compile(result.outputText, filename);
  return loaded.exports;
}

const utils = loadSource("src/features/chatbot/utils/chatbotUtils.ts");

test("compact customer chatbot keeps history, new chat, suggestions and help working", async () => {
  const language = require('./language-support.cjs').language;
  await language.i18n.changeLanguage('vi');
  let user = { id: 1 }, renderer, newChats = 0;
  const sent = [], destinations = [];
  const chat = { messages: [], draft: '', working: false, loading: false, revealingMessageId: null, send: text => sent.push(text), newConversation: () => newChats++ };
  const ui = { View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity', ScrollView: 'ScrollView', FlatList: 'FlatList', KeyboardAvoidingView: 'KeyboardAvoidingView', ActivityIndicator: 'Spinner', Platform: { OS: 'ios' }, Keyboard: { dismiss() {} } };
  const { ChatbotScreen } = loadSource('src/features/chatbot/components/ChatbotScreen.tsx', {
    'react-native': ui, '@expo/vector-icons': { Feather: 'Icon', MaterialCommunityIcons: 'Icon' },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 0 }) },
    'expo-router': { router: { push: route => destinations.push(route) }, useFocusEffect() {} },
    '@/store/hooks': { useAppDispatch: () => dispatchStub, useAppSelector: fn => fn({ auth: { user }, addressPicker: { selections: {} } }) },
    '@/features/address/stores/addressPickerSlice': { clearPickedAddress() {} },
    '@/components/common/RequireLoginNotice': { RequireLoginNotice: 'LoginNotice' },
    '@/components/ui': { EmptyState: 'EmptyState' },
    '../constants': { CHATBOT_ADDRESS_PICKER_KEY: 'test' },
    '../hooks/useChatbot': { useChatbot: () => chat },
    '../hooks/useChatbotCardNavigation': { useChatbotCardNavigation: () => ({ openCard() {} }) },
    './ChatbotComposer': { ChatbotComposer: 'Composer' },
    './ChatbotHistorySheet': { ChatbotHistorySheet: 'History' },
    './ChatbotMessageBubble': { ChatbotMessageBubble: 'Message' },
    './ChatbotThinkingIndicator': { ChatbotThinkingIndicator: 'Thinking' },
  });
  await act(async () => { renderer = create(React.createElement(ChatbotScreen)); });
  try {
    const button = label => renderer.root.findAllByType('TouchableOpacity').find(n => n.props.accessibilityLabel === label);
    await act(async () => button('Xem lịch sử trò chuyện').props.onPress());
    assert.equal(renderer.root.findByType('History').props.visible, true);
    await act(async () => renderer.root.findByType('History').props.onClose());
    await act(async () => button('Tạo cuộc trò chuyện mới').props.onPress());
    assert.equal(newChats, 1);
    await act(async () => button('Đặt lịch dịch vụ').props.onPress());
    assert.equal(sent.length, 1);
    await act(async () => button('Xem thêm gợi ý').props.onPress());
    assert.ok(button('Thêm địa chỉ mới'));
    await act(async () => button('Mở hướng dẫn sử dụng').props.onPress());
    assert.deepEqual(destinations, ['/help']);
    chat.working = true;
    await act(async () => renderer.update(React.createElement(ChatbotScreen)));
    assert.equal(button('Tạo cuộc trò chuyện mới').props.disabled, true);
    assert.equal(button('Xem lịch sử trò chuyện').props.disabled, true);
    user = null;
    await act(async () => renderer.update(React.createElement(ChatbotScreen)));
    assert.equal(renderer.root.findAllByType('LoginNotice').length, 1);
    assert.equal(renderer.root.findAllByType('Composer').length, 0);
  } finally { await act(async () => renderer.unmount()); }
});
test("help source card opens the article ID without fetching a personal booking", async () => {
  const destinations = [];
  let bookingCalls = 0, state, renderer;
  const { useChatbotCardNavigation } = loadSource("src/features/chatbot/hooks/useChatbotCardNavigation.ts", {
    "@/features/booking/api/bookingApi": { useLazyGetBookingDetailQuery: () => [() => { bookingCalls++; }] },
    "@/utils/toast": { showErrorToast: () => {} },
    "expo-router": { router: { push: (target) => destinations.push(target) } },
  });
  function Harness() { state = useChatbotCardNavigation(); return null; }
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => {
    await state.openCard({ type: "help", action: "OPEN_HELP_ARTICLE", article_id: 7 });
    await state.openCard({ type: "help", action: "OPEN_HELP_ARTICLE", article_id: -1 });
  });
  assert.deepEqual(destinations, [{ pathname: "/help/[id]", params: { id: "7" } }]);
  assert.equal(bookingCalls, 0);
  await act(async () => renderer.unmount());
});

test("retired article errors hide previously cached text", async () => {
  let renderer;
  const { default: Article } = loadSource("src/app/help/[id].tsx", {
    "@/features/chatbot/components/HelpArticleReader": { HelpArticleReader: "GuideReader" },
    "@/components/common/ScreenHeader": { ScreenHeader: "Header" },
    "@/components/common/RequireLoginNotice": { RequireLoginNotice: "Login" },
    "@/constants/theme": { COLORS: { primary: "green" } },
    "@/features/chatbot/api/chatbotApi": { useGetHelpArticleQuery: () => ({
      error: { status: 404 }, data: { title: "RETIRED PRIVATE TEXT", sections: [] }, isLoading: false,
    }) },
    "@/store/hooks": { useAppSelector: () => ({ id: 1 }) },
    "expo-router": { useLocalSearchParams: () => ({ id: "7" }) },
    "react-native": { ActivityIndicator: "Spinner", ScrollView: "Scroll", Text: "Text", TouchableOpacity: "Button", View: "View" },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
  });
  await act(async () => { renderer = create(React.createElement(Article)); });
  const tree = JSON.stringify(renderer.toJSON());
  assert.match(tree, /không còn khả dụng/);
  assert.doesNotMatch(tree, /RETIRED PRIVATE TEXT/);
  await act(async () => renderer.unmount());
});
test("provider overload and timeout display specific errors instead of a connection error", () => {
  const error = (code) => ({ status: 503, data: { errors: { chatbot_error_code: code } } });
  assert.match(utils.chatbotErrorMessage(error("CHATBOT_PROVIDER_BUSY")), /quá tải/);
  assert.match(utils.chatbotErrorMessage(error("CHATBOT_MODEL_TIMEOUT")), /phản hồi quá lâu/);
  assert.match(utils.chatbotErrorMessage(error("CHATBOT_RATE_LIMITED")), /giới hạn/);
  assert.match(utils.chatbotErrorMessage(error("CHATBOT_PROVIDER_CONFIG_ERROR")), /cấu hình/);
});
const { formatChatbotText } = loadSource("src/features/chatbot/utils/formatChatbotText.ts");

test("saved assistant replies show service names without Markdown markers", () => {
  const input = "CleanWise có các dịch vụ:\n\n1. **Dọn nhà tiêu chuẩn (Demo)** – Dịch vụ demo.\n2. **Dọn nhà theo giờ** – Giá 150.000đ.";
  assert.equal(formatChatbotText(input), "CleanWise có các dịch vụ:\n\n1. Dọn nhà tiêu chuẩn (Demo) – Dịch vụ demo.\n2. Dọn nhà theo giờ – Giá 150.000đ.");
});

test("plain response formatting preserves prices, IDs and literal arithmetic", () => {
  const input = "Giá 150.000đ, giảm 10%. Mã HOME_CLEANING_V2. Giá $5 và $10. 2 * 3 * 5 = 30.";
  assert.equal(formatChatbotText(input), input);
});

test("legacy assistant replies hide internal service-card reference JSON", () => {
  const input = `Hãy chọn dịch vụ:
{
  "references": [
    { "id": 12, "type": "service" },
    { "id": 15, "type": "service" }
  ]
}
Bạn muốn chọn dịch vụ nào?`;
  assert.equal(formatChatbotText(input), "Hãy chọn dịch vụ:\n\nBạn muốn chọn dịch vụ nào?");
});

test("common Markdown and LaTeX wrappers become readable plain text", () => {
  assert.equal(formatChatbotText("## Dịch vụ\n- **Dọn nhà**\n- *Theo giờ*\nGiá \\(150.000\\text{đ}\\)."), "Dịch vụ\n• Dọn nhà\n• Theo giờ\nGiá 150.000đ.");
  assert.equal(formatChatbotText("$$\\frac{1}{2} \\times 10$$"), "(1)/(2) × 10");
  assert.equal(formatChatbotText("Xem `CW-123` tại [CleanWise](https://example.com)."), "Xem CW-123 tại CleanWise (https://example.com).");
});
const now = () => new Date().toISOString();

const { useChatbotReveal } = loadSource("src/features/chatbot/hooks/useChatbotReveal.ts");

test("new replies reveal Unicode text before cards and clean up their timer", async (context) => {
  context.mock.timers.enable({ apis: ["setInterval"] });
  let state, renderer, completed = 0;
  function Harness({ animate = true }) {
    state = useChatbotReveal("Xin chào 👋 bạn", 2, animate, () => completed++);
    return null;
  }
  await act(async () => { renderer = create(React.createElement(Harness)); });
  assert.equal(state.text, "");
  assert.equal(state.cardCount, 0);
  await act(async () => { context.mock.timers.tick(33); });
  assert.equal(state.text, "Xin");
  assert.equal(state.cardCount, 0);
  await act(async () => { context.mock.timers.tick(33 * 4); });
  assert.equal(state.text, "Xin chào 👋 bạn");
  assert.equal(state.cardCount, 0);
  await act(async () => { context.mock.timers.tick(33 * 5); });
  assert.equal(state.cardCount, 1);
  await act(async () => { context.mock.timers.tick(33 * 6); });
  assert.equal(state.cardCount, 2);
  assert.equal(completed, 1);
  await act(async () => { renderer.unmount(); });
  await act(async () => { context.mock.timers.tick(1000); });
  assert.equal(completed, 1);
});

test("history shows full replies immediately and unmount cancels an unfinished reveal", async (context) => {
  context.mock.timers.enable({ apis: ["setInterval"] });
  let state, renderer, completed = 0;
  function Harness({ animate }) {
    state = useChatbotReveal("Một câu trả lời dài để kiểm tra", 3, animate, () => completed++);
    return null;
  }
  await act(async () => { renderer = create(React.createElement(Harness, { animate: false })); });
  assert.equal(state.text, "Một câu trả lời dài để kiểm tra");
  assert.equal(state.cardCount, 3);
  await act(async () => { renderer.update(React.createElement(Harness, { animate: true })); });
  assert.equal(state.text, "");
  await act(async () => { renderer.unmount(); });
  await act(async () => { context.mock.timers.tick(20000); });
  assert.equal(completed, 0);
});

test("only a newly received reply is marked for animation, and completion or switching clears it", async () => {
  const app = scenario({ conversations: [conversation()], messages: [message(1, "user"), message(2, "assistant")] });
  await app.mount();
  assert.equal(app.state.revealingMessageId, null);
  await act(async () => { await app.state.send("Đơn gần nhất?"); });
  assert.equal(app.state.revealingMessageId, 4);
  await act(async () => { app.state.finishReveal(2); });
  assert.equal(app.state.revealingMessageId, 4);
  await act(async () => { app.state.finishReveal(4); });
  assert.equal(app.state.revealingMessageId, null);
  await act(async () => { await app.state.send("Xem lịch"); });
  assert.equal(app.state.revealingMessageId, 6);
  await act(async () => { app.state.newConversation(); });
  assert.equal(app.state.revealingMessageId, null);
  await app.unmount();
});
const uuid = "c4b6ad40-d18f-4a85-a4d2-5d680b8b03b4";
const conversation = (id = 1, status = "ACTIVE") => ({
  id,
  title: "Tra đơn",
  status,
  created_at: now(),
  updated_at: now(),
});
function message(id, role, status = "COMPLETED", clientId = null) {
  return {
    id,
    role,
    status,
    text: role === "user" ? "Đơn gần nhất?" : "Đã tra cứu đơn.",
    client_message_id: clientId,
    cards: [],
    run_id: "run-1",
    created_at: now(),
  };
}
function reply(record, id = 1) {
  return {
    conversation_id: record.conversationId,
    replayed: false,
    run: { id: "run-1", status: "SUCCEEDED" },
    user_message: {
      ...message(id, "user", "COMPLETED", record.client_message_id),
      text: record.text,
    },
    assistant_message: message(id + 1, "assistant"),
  };
}

function scenario(options = {}) {
  let items = options.messages ?? [];
  const saved = new Map(options.storage ?? []);
  const requests = { send: [], pages: [], creates: 0 };
  const listeners = new Set();
  const storage = {
    getItem: async (key) => saved.get(key) ?? null,
    setItem: async (key, value) => {
      saved.set(key, value);
    },
    removeItem: async (key) => {
      saved.delete(key);
    },
  };
  const trigger =
    (callback) =>
    (...args) => ({
      unwrap: () => Promise.resolve().then(() => callback(...args)),
    });
  const list = trigger(() => ({
    results: options.conversations ?? [],
    count: 0,
  }));
  const getConversation = trigger((id) => conversation(id));
  const getMessages = trigger((params) => {
    requests.pages.push(params);
    if (requests.pages.length > 100) throw new Error("Unexpected refetch loop");
    if (options.getMessages) return options.getMessages(params);
    return {
      count: items.length,
      results: items.slice((params.page - 1) * 50, params.page * 50),
    };
  });
  const createConversation = trigger(() => {
    requests.creates++;
    return conversation();
  });
  const send = trigger(async (record) => {
    requests.send.push(record);
    if (options.send)
      return options.send(record, requests.send.length, (next) => {
        items = next;
      });
    const response = reply(record, items.length + 1);
    items = [...items, response.user_message, response.assistant_message];
    return response;
  });
  const getRun = trigger(() => options.run ?? { run: { status: "RUNNING" } });
  const { useChatbot } = loadSource(
    "src/features/chatbot/hooks/useChatbot.ts",
    {
      "@react-native-async-storage/async-storage": storage,
      "expo-crypto": { randomUUID: () => uuid },
      "expo-router": {
        useFocusEffect: (callback) => React.useEffect(callback, [callback]),
      },
      "react-native": {
        AppState: {
          currentState: "active",
          addEventListener: (_, callback) => {
            listeners.add(callback);
            return { remove: () => listeners.delete(callback) };
          },
        },
      },
      "../utils/chatbotUtils": utils,
      "../api/chatbotApi": {
        useLazyGetChatbotConversationsQuery: () => [list],
        useLazyGetChatbotConversationQuery: () => [getConversation],
        useLazyGetChatbotMessagesQuery: () => [getMessages],
        useLazyGetChatbotRunQuery: () => [getRun],
        useCreateChatbotConversationMutation: () => [createConversation],
        useSendChatbotMessageMutation: () => [send],
      },
    },
  );
  let state, renderer;
  function Harness() {
    state = useChatbot(options.userId ?? 1);
    return null;
  }
  return {
    get state() {
      return state;
    },
    requests,
    saved,
    async mount() {
      await act(async () => {
        renderer = create(React.createElement(Harness));
        await tick();
      });
    },
    async unmount() {
      await act(async () => {
        renderer.unmount();
      });
    },
    async foreground() {
      await act(async () => {
        listeners.forEach((callback) => callback("background"));
        await tick();
      });
      await act(async () => {
        listeners.forEach((callback) => callback("active"));
        await tick();
      });
    },
  };
}

test("welcome does not create an empty conversation; double send creates one turn", async () => {
  let finish;
  const s = scenario({
    send: (record) =>
      new Promise((resolve) => {
        finish = () => resolve(reply(record));
      }),
  });
  await s.mount();
  assert.equal(s.requests.creates, 0);
  assert.equal(s.state.loading, false);
  let first;
  await act(async () => {
    first = s.state.send("Đơn gần nhất?");
    await s.state.send("Đơn gần nhất?");
    await tick();
  });
  assert.equal(s.requests.send.length, 1);
  assert.equal(s.state.working, true);
  assert.equal(s.state.messages.length, 1);
  assert.equal(
    JSON.parse(s.saved.get("cleanwise:chatbot:pending:1")).client_message_id,
    uuid,
  );
  await act(async () => {
    finish();
    await first;
    await tick();
  });
  assert.equal(s.requests.creates, 1);
  assert.equal(s.state.messages.length, 2);
  assert.equal(s.state.pending, null);
  assert.equal(s.saved.size, 0);
  await s.unmount();
});

test("lost HTTP response recovers committed answer without another POST", async () => {
  const s = scenario({
    send: (record, _, commit) => {
      const response = reply(record);
      commit([response.user_message, response.assistant_message]);
      throw { data: "Network Error" };
    },
  });
  await s.mount();
  await act(async () => {
    await s.state.send("Đơn gần nhất?");
    await tick();
  });
  assert.equal(s.state.messages.length, 2);
  assert.equal(s.state.pending, null);
  assert.equal(s.state.replyError, null);
  assert.equal(s.requests.send.length, 1);
  await s.unmount();
});

test("failed request retries the same UUID and original text", async () => {
  const s = scenario({
    send: (record, count, commit) => {
      if (count === 1) {
        commit([message(1, "user", "FAILED", record.client_message_id)]);
        throw {
          status: 503,
          data: { errors: { chatbot_error_code: "CHATBOT_NOT_CONFIGURED" } },
        };
      }
      const response = reply(record);
      commit([response.user_message, response.assistant_message]);
      return response;
    },
  });
  await s.mount();
  await act(async () => {
    await s.state.send("Đơn gần nhất?");
    await tick();
  });
  assert.equal(s.state.phase, "failed");
  assert.match(s.state.replyError, /chưa sẵn sàng/);
  await act(async () => {
    s.state.retry();
    await tick();
  });
  assert.equal(s.requests.send.length, 2);
  assert.equal(
    s.requests.send[0].client_message_id,
    s.requests.send[1].client_message_id,
  );
  assert.equal(s.requests.send[0].text, s.requests.send[1].text);
  assert.equal(s.state.pending, null);
  assert.equal(s.state.messages.length, 2);
  await s.unmount();
});

test("retry clears history and reply errors and shows the saved question as processing", async () => {
  const items = Array.from({ length: 101 }, (_, i) => message(i + 1, i % 2 ? "assistant" : "user"));
  items[100] = message(101, "user", "FAILED", uuid);
  const record = { conversation_id: 1, client_message_id: uuid, text: items[100].text, created_at: items[100].created_at };
  let failHistory = false, finishRetry;
  const s = scenario({
    conversations: [conversation()],
    storage: [["cleanwise:chatbot:pending:1", JSON.stringify(record)]],
    getMessages: ({ page }) => {
      if (failHistory) throw { status: 503 };
      return { count: items.length, results: items.slice((page - 1) * 50, page * 50) };
    },
    send: (sent) => new Promise((resolve) => { finishRetry = () => resolve(reply(sent, 101)); }),
  });
  await s.mount();
  assert.equal(s.state.phase, "failed");
  assert.ok(s.state.replyError);
  failHistory = true;
  await act(async () => { await s.state.loadOlder(); });
  assert.ok(s.state.loadError);
  await act(async () => { s.state.retry(); await tick(); });
  assert.equal(s.state.working, true);
  assert.equal(s.state.loadError, null);
  assert.equal(s.state.replyError, null);
  assert.equal(s.state.messages.find((item) => item.id === 101).status, "PROCESSING");
  await act(async () => { finishRetry(); await tick(); });
  assert.equal(s.state.working, false);
  assert.equal(s.state.messages.find((item) => item.id === 101).status, "COMPLETED");
  await s.unmount();
});

test("editing a failed question stays editable after refresh instead of restoring the failure", async () => {
  const s = scenario({
    conversations: [conversation()],
    messages: [message(1, "user", "FAILED", uuid)],
  });
  await s.mount();
  assert.equal(s.state.phase, "failed");
  await act(async () => {
    s.state.editQuestion();
    await tick();
  });
  await s.foreground();
  assert.equal(s.state.draft, "Đơn gần nhất?");
  assert.equal(s.state.pending, null);
  assert.equal(s.state.phase, "idle");
  assert.equal(s.state.replyError, null);
  await s.unmount();
});

test("app restart restores pending UUID, checks run, and accepts its completed reply", async () => {
  const user = message(1, "user", "PROCESSING", uuid);
  const pending = {
    conversation_id: 1,
    client_message_id: uuid,
    text: user.text,
    created_at: user.created_at,
  };
  const s = scenario({
    conversations: [conversation()],
    messages: [user],
    storage: [["cleanwise:chatbot:pending:1", JSON.stringify(pending)]],
    run: {
      run: { status: "SUCCEEDED" },
      user_message: { ...user, status: "COMPLETED" },
      assistant_message: message(2, "assistant"),
    },
  });
  await s.mount();
  await s.foreground();
  assert.equal(s.state.phase, "idle");
  assert.equal(s.state.messages.length, 2);
  assert.equal(s.state.pending, null);
  assert.equal(s.requests.send.length, 0);
  assert.equal(s.saved.size, 0);
  await s.unmount();
});

test("pending records from a different account are never loaded", async () => {
  const pending = {
    conversation_id: 1,
    client_message_id: uuid,
    text: "Private question",
    created_at: now(),
  };
  const s = scenario({
    userId: 2,
    storage: [["cleanwise:chatbot:pending:1", JSON.stringify(pending)]],
  });
  await s.mount();
  assert.equal(s.state.messages.length, 0);
  assert.equal(s.state.pending, null);
  assert.equal(s.requests.pages.length, 0);
  assert.equal(s.saved.size, 1);
  await s.unmount();
});

test("history starts at newest pages and loads older messages without duplicates", async () => {
  const messages = Array.from({ length: 130 }, (_, i) =>
    message(i + 1, i % 2 ? "assistant" : "user"),
  );
  const s = scenario({ conversations: [conversation()], messages });
  await s.mount();
  assert.equal(s.state.messages[0].id, 51);
  assert.equal(s.state.messages.at(-1).id, 130);
  assert.equal(s.state.hasOlder, true);
  await act(async () => {
    await s.state.loadOlder();
    await tick();
  });
  assert.equal(s.state.messages.length, 130);
  assert.equal(s.state.messages[0].id, 1);
  assert.equal(s.state.hasOlder, false);
  await s.unmount();
});

test("late history response cannot replace the newly selected conversation", async () => {
  let release;
  const s = scenario({
    getMessages: ({ conversationId }) =>
      conversationId === 1
        ? new Promise((resolve) => {
            release = () =>
              resolve({ count: 1, results: [message(1, "assistant")] });
          })
        : { count: 1, results: [message(2, "assistant")] },
  });
  await s.mount();
  let first;
  await act(async () => {
    first = s.state.openConversation(conversation(1));
    await tick();
  });
  await act(async () => {
    await s.state.openConversation(conversation(2));
    await tick();
  });
  await act(async () => {
    release();
    await first;
    await tick();
  });
  assert.equal(s.state.conversation.id, 2);
  assert.deepEqual(
    s.state.messages.map((item) => item.id),
    [2],
  );
  await s.unmount();
});

test("closed conversation does not send; new conversation can send", async () => {
  const s = scenario({ conversations: [conversation(1, "CLOSED")] });
  await s.mount();
  await act(async () => {
    await s.state.send("hello");
  });
  assert.equal(s.requests.send.length, 0);
  await act(async () => {
    s.state.newConversation();
    await tick();
  });
  await act(async () => {
    await s.state.send("hello");
    await tick();
  });
  assert.equal(s.requests.send.length, 1);
  await s.unmount();
});

test("storage parser rejects malformed, oversized, and invalid-ID pending messages", () => {
  const valid = {
    conversation_id: 1,
    client_message_id: uuid,
    text: "Question",
    created_at: now(),
  };
  assert.deepEqual(utils.parsePendingMessage(JSON.stringify(valid)), valid);
  for (const value of [
    "{",
    null,
    JSON.stringify({ ...valid, text: "x".repeat(2001) }),
    JSON.stringify({ ...valid, client_message_id: "invalid" }),
    JSON.stringify({ ...valid, conversation_id: -1 }),
  ]) {
    assert.equal(utils.parsePendingMessage(value), null);
  }
});

test("schedule action fetches current booking data before opening the existing screen", async () => {
  const destinations = [],
    failures = [];
  const schedule = { id: 12, status: "PENDING", worker: { worker_id: 3 } };
  const { useChatbotCardNavigation } = loadSource(
    "src/features/chatbot/hooks/useChatbotCardNavigation.ts",
    {
      "@/features/booking/api/bookingApi": {
        useLazyGetBookingDetailQuery: () => [
          (id) => ({
            unwrap: async () => ({
              id,
              status: "ASSIGNED",
              schedules: [schedule],
            }),
          }),
        ],
      },
      "@/utils/toast": { showErrorToast: (...args) => failures.push(args) },
      "expo-router": {
        router: { push: (destination) => destinations.push(destination) },
      },
    },
  );
  let state, renderer;
  function Harness() {
    state = useChatbotCardNavigation();
    return null;
  }
  await act(async () => {
    renderer = create(React.createElement(Harness));
  });
  await act(async () => {
    await state.openCard({
      type: "schedule",
      action: "OPEN_SCHEDULE",
      booking_id: 4,
      schedule_id: 12,
    });
  });
  assert.equal(destinations[0].pathname, "/booking/schedule/[id]");
  assert.deepEqual(JSON.parse(destinations[0].params.data), schedule);
  assert.equal(destinations[0].params.bookingStatus, "ASSIGNED");
  await act(async () => {
    await state.openCard({
      type: "schedule",
      action: "OPEN_SCHEDULE",
      booking_id: 4,
      schedule_id: 999,
    });
  });
  assert.equal(destinations.length, 1);
  assert.equal(failures.length, 1);
  await act(async () => {
    renderer.unmount();
  });
});

test("a schedule fetch cannot navigate after the account screen has unmounted", async () => {
  const destinations = [];
  let resolveBooking;
  const { useChatbotCardNavigation } = loadSource("src/features/chatbot/hooks/useChatbotCardNavigation.ts", {
    "@/features/booking/api/bookingApi": { useLazyGetBookingDetailQuery: () => [() => ({
      unwrap: () => new Promise((resolve) => { resolveBooking = resolve; }),
    })] },
    "@/utils/toast": { showErrorToast: () => {} },
    "expo-router": { router: { push: (destination) => destinations.push(destination) } },
  });
  let state, renderer, request;
  function Harness() { state = useChatbotCardNavigation(); return null; }
  await act(async () => { renderer = create(React.createElement(Harness)); });
  await act(async () => { request = state.openCard({ type: "schedule", action: "OPEN_SCHEDULE", booking_id: 4, schedule_id: 12 }); });
  await act(async () => { renderer.unmount(); });
  await act(async () => { resolveBooking({ id: 4, status: "ASSIGNED", schedules: [{ id: 12 }] }); await request; });
  assert.equal(destinations.length, 0);
});

async function renderHistory(deleteRequest) {
  const alerts = [], requests = [], deleted = [], selected = [];
  const data = { results: [conversation(1), conversation(2)], next: null };
  const { ChatbotHistorySheet } = loadSource("src/features/chatbot/components/ChatbotHistorySheet.tsx", {
    "@/components/ui/BottomSheet": { BottomSheet: "BottomSheet" },
    "@/components/ui": { EmptyState: "EmptyState" },
    "@/constants/theme": { COLORS: {} },
    "@expo/vector-icons": { Feather: "Feather" },
    "react-native": {
      ActivityIndicator: "ActivityIndicator", Text: "Text", View: "View",
      TouchableOpacity: "TouchableOpacity", useWindowDimensions: () => ({ height: 800 }),
      Alert: { alert: (...args) => alerts.push(args) },
      FlatList: (props) => React.createElement("HistoryList", props,
        props.data.map((item) => React.createElement(React.Fragment, { key: item.id }, props.renderItem({ item })))),
    },
    "../api/chatbotApi": {
      useGetChatbotConversationsQuery: () => ({ currentData: data, refetch: () => {} }),
      useDeleteChatbotConversationMutation: () => [(id) => {
        requests.push(id);
        return { unwrap: () => deleteRequest(id) };
      }],
    },
    "../utils/chatbotUtils": utils,
  });
  const props = { visible: true, userId: 1, selectedId: 1, onClose: () => {},
    onSelect: (item) => selected.push(item.id), onDeleted: (id) => deleted.push(id) };
  let renderer;
  await act(async () => { renderer = create(React.createElement(ChatbotHistorySheet, props)); });
  return { renderer, alerts, requests, deleted, selected, props, ChatbotHistorySheet,
    ids: () => renderer.root.findByType("HistoryList").props.data.map((item) => item.id),
    askDelete: () => renderer.root.findAllByType("TouchableOpacity")
      .find((button) => button.props.accessibilityLabel?.startsWith("Xóa cuộc trò chuyện")).props.onPress(),
  };
}

test("deleting history requires confirmation and hides deleted rows even if cached history is stale", async () => {
  const h = await renderHistory(() => Promise.resolve());
  await act(async () => { h.askDelete(); });
  assert.deepEqual(h.requests, []);
  assert.equal(h.alerts[0][2][0].style, "cancel");
  await act(async () => { await h.alerts[0][2][1].onPress(); });
  assert.deepEqual(h.requests, [1]);
  assert.deepEqual(h.deleted, [1]);
  assert.deepEqual(h.selected, []);
  assert.deepEqual(h.ids(), [2]);
  await act(async () => { h.renderer.update(React.createElement(h.ChatbotHistorySheet, { ...h.props, visible: false })); });
  await act(async () => { h.renderer.update(React.createElement(h.ChatbotHistorySheet, h.props)); });
  assert.deepEqual(h.ids(), [2]);
  await act(async () => { h.renderer.unmount(); });
});

test("busy or failed delete keeps the conversation in history", async () => {
  const h = await renderHistory(() => Promise.reject({ status: 409, data: { errors: { chatbot_error_code: "CONVERSATION_BUSY" } } }));
  await act(async () => { h.askDelete(); });
  await act(async () => { await h.alerts[0][2][1].onPress(); });
  assert.deepEqual(h.ids(), [1, 2]);
  assert.deepEqual(h.deleted, []);
  assert.match(h.alerts[1][1], /đang xử lý/);
  await act(async () => { h.renderer.unmount(); });
});

test("duplicate delete confirmation does not send two requests; missing conversation is removed locally", async () => {
  let rejectDelete;
  const h = await renderHistory(() => new Promise((_resolve, reject) => { rejectDelete = reject; }));
  await act(async () => { h.askDelete(); });
  let pending;
  await act(async () => { pending = h.alerts[0][2][1].onPress(); });
  await act(async () => { await h.alerts[0][2][1].onPress(); });
  assert.deepEqual(h.requests, [1]);
  await act(async () => { rejectDelete({ status: 404 }); await pending; });
  assert.deepEqual(h.ids(), [2]);
  assert.deepEqual(h.deleted, [1]);
  await act(async () => { h.renderer.unmount(); });
});
