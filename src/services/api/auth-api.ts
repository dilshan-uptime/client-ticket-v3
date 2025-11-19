import { POST } from "./base-api";
import type { AuthenticationResponse } from "@/models/auth";
import type { Observable } from "rxjs";

export interface MsSignInRequest {
  token: string;
}

export const msSignIn = (
  idToken: string
): Observable<AuthenticationResponse> => {
  return POST<AuthenticationResponse>(
    "/api/v1/auth/ms-sign-in",
    { token: idToken },
    undefined,
    { isPublic: true }
  );
};
