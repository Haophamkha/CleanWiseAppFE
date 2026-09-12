import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationState = {
  unreadCount: number;
};

// TODO: mock ban đầu - khi có BE, lấy unreadCount thật lúc bootstrap app
// (giống cách useAuthBootstrap rehydrate token) thay vì hard-code ở đây.
const initialState: NotificationState = {
  unreadCount: 1,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, decrementUnreadCount, clearUnreadCount } =
  notificationSlice.actions;
export default notificationSlice.reducer;
