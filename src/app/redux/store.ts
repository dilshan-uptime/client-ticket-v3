import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import appReducer from "./appSlice";
import metadataReducer from "./metadataSlice";

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    metadata: metadataReducer,
  },
});

store.subscribe(() => {});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
