import { LoginPage } from "../pages/LoginPage";
import { SignUpPage } from "../pages/SignUpPage";

export const LOGIN = "/login";
export const SIGNUP = "/sign-up";

export const routes = [
  {
    path: LOGIN,
    component: LoginPage,
    isPrivate: false,
    permission: [],
  },
  {
    path: SIGNUP,
    component: SignUpPage,
    isPrivate: false,
    permission: [],
  },
];

export default routes;
