import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { GlobalModalProps } from "@/models/modal";
import type { RootState } from "./store";

export interface AppReducerState {
  appLoading: boolean;
  modal: GlobalModalProps;
}

export const initialState: AppReducerState = {
  appLoading: false,
  modal: { open: false, title: "", bodyId: null, params: {}, width: undefined },
};

const handleLoadingSuccess = (state: AppReducerState): void => {
  // eslint-disable-next-line no-param-reassign
  state.appLoading = false;
};

const setLoading = (
  state: AppReducerState,
  action: PayloadAction<boolean>
): void => {
  // eslint-disable-next-line no-param-reassign
  state.appLoading = action.payload;
};

// Modal props
const openModal = (
  state: AppReducerState,
  action: PayloadAction<GlobalModalProps>
): void => {
  state.modal = { ...state.modal, ...action.payload };
};

const closeModal = (state: AppReducerState): void => {
  state.modal = { ...state.modal, ...initialState.modal };
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    loadingSuccess: handleLoadingSuccess,
    setLoading,
    openModal,
    closeModal,
  },
});

export const getAppLoading = (state: RootState) => state.app.appLoading;
export const getModalData = (state: RootState) => state.app.modal;

export const appActions = {
  ...appSlice.actions,
};

export default appSlice.reducer;
