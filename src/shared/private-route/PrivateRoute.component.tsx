import { useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { ProtectedLayout } from "@/app/container/ProtectedLayout";
import { loginRequest } from "@/config/msalConfig";

export interface ProtectedRouteProps {
  children: React.ComponentType;
}

export const PrivateRoute = ({ children }: any) => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest).catch((error) => {
        console.error("Login redirect failed:", error);
      });
    }
  }, [isAuthenticated, inProgress, instance]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
          <p className="text-gray-600">Redirecting to Microsoft login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProtectedLayout>{children}</ProtectedLayout>
    </>
  );
};
