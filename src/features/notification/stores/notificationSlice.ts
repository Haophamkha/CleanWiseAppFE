import { notificationApi } from "@/features/notification/api/notificationApi";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type NotificationState = {
  unreadCount: number;
};

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        notificationApi.endpoints.getUnreadCount.matchFulfilled,
        (state, action) => {
          state.unreadCount = action.payload;
        },
      )
      .addMatcher(
        notificationApi.endpoints.getNotifications.matchFulfilled,
        (state, action) => {
          state.unreadCount = action.payload.unread_count;
        },
      );
  },
});

export const { clearUnreadCount, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
