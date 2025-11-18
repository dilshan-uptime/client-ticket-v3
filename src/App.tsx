import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { useIsAuthenticated } from "@azure/msal-react";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import { AppContainer } from "./app/container/App.container";
import { AuthProvider } from "./components/AuthProvider";
import { LandingPage } from "./pages/LandingPage";

import "./App.css";

function App() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <LandingPage />;
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
