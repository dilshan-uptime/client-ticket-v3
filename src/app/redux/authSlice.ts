import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { AuthenticationResponse } from "@/models/auth";
import { AUTH_RESPONSE } from "@/constants/storage";

interface AuthReducerState {
  auth: AuthenticationResponse | null;
}

const initialState: AuthReducerState = {
  auth: null,
};

//Actions
const handleAuthenticationSuccess = (
  state: AuthReducerState,
  action: PayloadAction<AuthenticationResponse>
): void => {
  state.auth = action.payload;
};

const handleLogoutUser = (state: AuthReducerState): void => {
  state.auth = null;

  localStorage.removeItem(AUTH_RESPONSE);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: handleLogoutUser,
    authenticateUserSuccess: handleAuthenticationSuccess,
  },
});

export const getAuth = (state: RootState) => state.auth.auth;

export const authActions = {
  ...authSlice.actions,
};

export default authSlice.reducer;
