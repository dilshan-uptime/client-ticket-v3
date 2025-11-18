import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { AuthProvider } from "./components/AuthProvider";
import { loginRequest } from "./config/msalConfig";

import "./App.css";

function App() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest).catch((error) => {
        console.error("Login failed:", error);
      });
    }
  }, [isAuthenticated, inProgress, instance]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Signing in with Microsoft...</h2>
          <p className="text-gray-600">Please wait while we redirect you to Microsoft login.</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <GlobalModal />
        <AppContainer />
      </AuthProvider>
    </Provider>
  );
}

export default App;
