import type { Address } from "@/features/address/types/Address";
import type { ServiceDetail } from "@/features/service/types/Service";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BookingDraftState = {
  service: ServiceDetail | null;
  values: Record<string, any>;
  addresses: Record<string, Address>;
};

const initialState: BookingDraftState = {
  service: null,
  values: {},
  addresses: {},
};

const bookingDraftSlice = createSlice({
  name: "bookingDraft",
  initialState,
  reducers: {
    setBookingDraft: (_state, action: PayloadAction<BookingDraftState>) =>
      action.payload,
    clearBookingDraft: () => initialState,
  },
});

export const { setBookingDraft, clearBookingDraft } = bookingDraftSlice.actions;
export default bookingDraftSlice.reducer;
