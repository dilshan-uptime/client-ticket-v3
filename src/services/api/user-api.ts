import { Observable } from "rxjs";

import { GET, POST } from "./base-api";
import type {
  AuthenticationResponse,
  LoginRequest,
  SignOutRequest,
  SignUpRequest,
  SignUpResponse,
  ValidateTokenResponse,
} from "@/models/auth";

const ROOT_PATH = "api/v1/auth";

const USER_LOGIN_ENDPOINT = `${ROOT_PATH}/sign-in`;
const VALIDATE_TOKEN_ENDPOINT = `${ROOT_PATH}/validate`;
const USER_SIGNUP_ENDPOINT = `${ROOT_PATH}/sign-up`;
const USER_SIGN_OUT_ENDPOINT = `${ROOT_PATH}/sign-out`;

export const authenticateUser = (
  auth: LoginRequest
): Observable<AuthenticationResponse> =>
  POST(USER_LOGIN_ENDPOINT, { ...auth }, undefined, { isPublic: true });

export const userSignUp = (
  signUpRequest: SignUpRequest
): Observable<SignUpResponse> =>
  POST(USER_SIGNUP_ENDPOINT, { ...signUpRequest });

export const userSignOut = (
  signOutRequest: SignOutRequest
): Observable<boolean> => POST(USER_SIGN_OUT_ENDPOINT, { ...signOutRequest });

export const validateToken = (): Observable<ValidateTokenResponse> =>
  GET(VALIDATE_TOKEN_ENDPOINT);
