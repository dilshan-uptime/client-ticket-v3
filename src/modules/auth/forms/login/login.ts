import { object, string, boolean, Schema } from "yup";

export interface LoginModel {
  username: string;
  password: string;
  rememberMe: boolean;
}

export type LoginValidationSchema = Schema<LoginModel>;

export const getLoginInitialValues = (): LoginModel => ({
  username: "",
  password: "",
  rememberMe: false,
});

export const getLoginValidationSchema = (): LoginValidationSchema =>
  object({
    username: string().required("Username is required"),
    password: string().required("Password is required"),
    rememberMe: boolean().default(false),
  });
