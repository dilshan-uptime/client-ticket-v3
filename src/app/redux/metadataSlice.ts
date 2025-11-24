import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { SystemMetadata } from "@/models/metadata";

interface MetadataReducerState {
  metadata: SystemMetadata | null;
}

const initialState: MetadataReducerState = {
  metadata: null,
};

const handleSetMetadata = (
  state: MetadataReducerState,
  action: PayloadAction<SystemMetadata>
): void => {
  state.metadata = action.payload;
};

const handleClearMetadata = (state: MetadataReducerState): void => {
  state.metadata = null;
};

const metadataSlice = createSlice({
  name: "metadata",
  initialState,
  reducers: {
    setMetadata: handleSetMetadata,
    clearMetadata: handleClearMetadata,
  },
});

export const getMetadata = (state: RootState) => state.metadata.metadata;

export const metadataActions = {
  ...metadataSlice.actions,
};

export default metadataSlice.reducer;
