import type { User } from "./user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  refreshToken: string;
  token: string;
  user: User;
}

export interface RefreshTokenResponse {
  bearerToken: string;
}

export interface ValidateTokenResponse {
  validated: boolean;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number | null;
}

export interface SignUpResponse {
  publicId: string;
  publicCode: string;
}

export interface SignOutRequest {
  refreshToken: string;
}
