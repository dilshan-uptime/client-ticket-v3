import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { BackendAuthProvider, useBackendAuth } from "./contexts/BackendAuthContext";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";

import "./App.css";

function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { isBackendAuthReady, isBackendAuthLoading } = useBackendAuth();

  // Show loading while MSAL is processing redirect
  if (inProgress === InteractionStatus.HandleRedirect || inProgress === InteractionStatus.Startup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#ee754e]/5 via-white to-[#1fb6a6]/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#ee754e] mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-900">Authenticating...</h2>
          <p className="text-gray-600">Please wait while we sign you in</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Show loading while backend token exchange is in progress
  // Only show this if user IS authenticated but backend token not ready yet
  if (isAuthenticated && (isBackendAuthLoading || !isBackendAuthReady)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#ee754e]/5 via-white to-[#1fb6a6]/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#ee754e] mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-900">Completing Sign-In...</h2>
          <p className="text-gray-600">Setting up your session</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Toaster richColors position="top-right" />
        <GlobalModal />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<AppContainer />} />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <BackendAuthProvider>
          <AppRoutes />
        </BackendAuthProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
