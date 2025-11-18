import { Provider } from "react-redux";
import { Toaster } from "sonner";

import store from "./app/redux/store";
import { GlobalModal } from "./shared/global-modal/GlobalModal";
import storage from "./services/storage/local-storage";
import { AUTH_RESPONSE } from "./constants/storage";
import { setBearerToken } from "./services/api/base-api";
import { AppContainer } from "./app/container/App.container";

import "./App.css";

function App() {
  const auth = storage.get(AUTH_RESPONSE);
  if (auth?.token) {
    setBearerToken(auth.token);
  }

  return (
    <Provider store={store}>
      <Toaster richColors position="top-right" />

      <GlobalModal />
      <AppContainer />
    </Provider>
  );
}

export default App;
