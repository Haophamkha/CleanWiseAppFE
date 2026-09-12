import { configureStore } from "@reduxjs/toolkit";
import { provinceApi } from "../services/provinceApi";
import authReducer from "./authSlice";
import { baseApi } from "./baseApi";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [provinceApi.reducerPath]: provinceApi.reducer,
    auth: authReducer,
    notification: notificationReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(baseApi.middleware, provinceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
