import type { SignUpRequest } from "@/models/auth";
import { object, string, Schema, number } from "yup";

export type SignUpValidationSchema = Schema<SignUpRequest>;

export const getSignUpInitialValues = (): SignUpRequest => ({
  firstName: "",
  lastName: "",
  email: "",
  roleId: null,
});

export const getSignUpValidationSchema = (): SignUpValidationSchema =>
  object({
    firstName: string().required("FirstName is required"),
    lastName: string().required("LastName is required"),
    email: string().email("Invalid email").required("Email is required"),
    roleId: number().required("Role is required"),
  });
