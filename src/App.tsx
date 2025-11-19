import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { AuthProvider } from "./components/AuthProvider";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./App.css";

function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

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
