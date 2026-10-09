import { baseApi } from "@/store/baseApi";
import type {
  ChatbotConversation,
  ChatbotMessage,
  ChatbotPage,
  ChatbotReply,
  ChatbotRunDetail,
  HelpArticle,
} from "../types/chatbot";

const unwrap = <T>(response: { data: T }): T => response.data;

export const chatbotApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHelpArticles: builder.query<HelpArticle[], void>({
      query: () => ({ url: "/api/chatbot/help-articles/", method: "GET" }),
      transformResponse: unwrap<HelpArticle[]>,
      keepUnusedDataFor: 0,
    }),
    getHelpArticle: builder.query<HelpArticle, number>({
      query: (id) => ({ url: `/api/chatbot/help-articles/${id}/`, method: "GET" }),
      transformResponse: unwrap<HelpArticle>,
      keepUnusedDataFor: 0,
    }),
    getChatbotConversations: builder.query<
      ChatbotPage<ChatbotConversation>,
      { userId: number; page: number }
    >({
      query: ({ page }) => ({
        url: "/api/chatbot/conversations/",
        method: "GET",
        params: { page },
      }),
      transformResponse: unwrap<ChatbotPage<ChatbotConversation>>,
      providesTags: ["ChatbotConversations"],
    }),
    getChatbotConversation: builder.query<ChatbotConversation, number>({
      query: (id) => ({
        url: `/api/chatbot/conversations/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap<ChatbotConversation>,
      providesTags: (_result, _error, id) => [{ type: "ChatbotConversations", id }],
    }),
    createChatbotConversation: builder.mutation<ChatbotConversation, void>({
      query: () => ({
        url: "/api/chatbot/conversations/",
        method: "POST",
        data: {},
      }),
      transformResponse: unwrap<ChatbotConversation>,
      invalidatesTags: ["ChatbotConversations"],
    }),
    deleteChatbotConversation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/chatbot/conversations/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, error) => error ? [] : ["ChatbotConversations"],
    }),
    getChatbotMessages: builder.query<
      ChatbotPage<ChatbotMessage>,
      { conversationId: number; page: number }
    >({
      query: ({ conversationId, page }) => ({
        url: `/api/chatbot/conversations/${conversationId}/messages/`,
        method: "GET",
        params: { page, page_size: 50 },
      }),
      transformResponse: unwrap<ChatbotPage<ChatbotMessage>>,
      providesTags: (_result, _error, { conversationId }) => [
        { type: "ChatbotConversations", id: conversationId },
      ],
    }),
    sendChatbotMessage: builder.mutation<
      ChatbotReply,
      { conversationId: number; text: string; client_message_id: string }
    >({
      query: ({ conversationId, ...data }) => ({
        url: `/api/chatbot/conversations/${conversationId}/messages/`,
        method: "POST",
        data,
        timeout: 130000,
      }),
      transformResponse: unwrap<ChatbotReply>,
      invalidatesTags: ["ChatbotConversations"],
    }),
    getChatbotRun: builder.query<ChatbotRunDetail, string>({
      query: (id) => ({ url: `/api/chatbot/runs/${id}/`, method: "GET" }),
      transformResponse: unwrap<ChatbotRunDetail>,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHelpArticlesQuery,
  useGetHelpArticleQuery,
  useGetChatbotConversationsQuery,
  useLazyGetChatbotConversationsQuery,
  useLazyGetChatbotConversationQuery,
  useCreateChatbotConversationMutation,
  useDeleteChatbotConversationMutation,
  useLazyGetChatbotMessagesQuery,
  useSendChatbotMessageMutation,
  useLazyGetChatbotRunQuery,
} = chatbotApi;
