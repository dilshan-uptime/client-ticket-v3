import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { InteractionStatus } from "@azure/msal-browser";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { AuthProvider } from "./components/AuthProvider";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./App.css";

function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const location = useLocation();

  useEffect(() => {
    console.log('[App] Authentication state:', isAuthenticated, 'inProgress:', inProgress, 'Current path:', location.pathname);
  }, [isAuthenticated, inProgress, location.pathname]);

  // Show loading while MSAL is processing redirect
  if (inProgress === InteractionStatus.HandleRedirect || inProgress === InteractionStatus.Startup) {
    console.log('[App] MSAL is processing redirect, showing loading...');
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
    console.log('[App] User not authenticated, showing login page');
    return (
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  console.log('[App] User authenticated, showing app routes');
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster richColors position="top-right" />
          <GlobalModal />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<AppContainer />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
