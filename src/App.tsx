import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { useEffect } from "react";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { AuthProvider } from "./components/AuthProvider";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./App.css";

function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  useEffect(() => {
    console.log('[App] Authentication state:', isAuthenticated, 'Current path:', location.pathname);
  }, [isAuthenticated, location.pathname]);

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
