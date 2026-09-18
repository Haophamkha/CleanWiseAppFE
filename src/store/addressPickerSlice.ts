import type { Address } from "@/types/Address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AddressPickerState = {
  selections: Record<string, Address>;
};

const initialState: AddressPickerState = { selections: {} };

const addressPickerSlice = createSlice({
  name: "addressPicker",
  initialState,
  reducers: {
    setPickedAddress: (
      state,
      action: PayloadAction<{ key: string; address: Address }>,
    ) => {
      state.selections[action.payload.key] = action.payload.address;
    },
    clearPickedAddress: (state, action: PayloadAction<string>) => {
      delete state.selections[action.payload];
    },
  },
});

export const { setPickedAddress, clearPickedAddress } =
  addressPickerSlice.actions;
export default addressPickerSlice.reducer;
