import { useIsAuthenticated } from "@azure/msal-react";
import { ProtectedLayout } from "@/app/container/ProtectedLayout";
import { Navigate } from "react-router-dom";

export interface ProtectedRouteProps {
  children: React.ComponentType;
}

export const PrivateRoute = ({ children }: any) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ProtectedLayout>{children}</ProtectedLayout>
    </>
  );
};
