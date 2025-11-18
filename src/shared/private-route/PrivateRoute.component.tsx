import { Navigate } from "react-router-dom";

import { validateToken } from "@/services/api/user-api";

import { handleUnauthorizedKickOut } from "@/services/api/base-api";

import storage from "@/services/storage/local-storage";
import { AUTH_RESPONSE } from "@/constants/storage";
import { ProtectedLayout } from "@/app/container/ProtectedLayout";
import { LOGIN } from "@/modules/auth/routes";
import { logger } from "@/services/logger/logger";
import type { ValidateTokenResponse } from "@/models/auth";

export interface ProtectedRouteProps {
  children: React.ComponentType;
}

export const PrivateRoute = ({ children }: any) => {
  const auth = storage.get(AUTH_RESPONSE);

  if (auth === null) {
    return <Navigate to={LOGIN} replace />;
  } else {
    validateToken().subscribe({
      next: (response: ValidateTokenResponse) => {
        if (!response.validated) {
          handleUnauthorizedKickOut();
        }
      },

      error: (e) => {
        logger.error(e);

        if (e?.response?.status === 401) {
          handleUnauthorizedKickOut();

          return <Navigate to={LOGIN} replace />;
        }
      },

      complete() {},
    });
  }

  return (
    <>
      <ProtectedLayout>{children}</ProtectedLayout>
    </>
  );
};
