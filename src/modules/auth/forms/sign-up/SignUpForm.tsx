import { useState } from "react";
import { Form, Formik, Field } from "formik";
import { useNavigate, Link } from "react-router";

import { useAppDispatch } from "@/hooks/store-hooks";
import { AUTH_RESPONSE } from "@/constants/storage";
import storage from "@/services/storage/local-storage";

import { setBearerToken } from "@/services/api/base-api";

import { authActions } from "@/app/redux/authSlice";
import { Button } from "@/components/ui/button";

import { authenticateUser, userSignUp } from "@/services/api/user-api";
import type { AuthenticationResponse, SignUpResponse } from "@/models/auth";
import { errorHandler } from "@/services/other/error-handler";
import { HOME } from "@/app/routes/client";
import { AppInput } from "@/shared/forms/AppInput.component";
import { getSignUpInitialValues, getSignUpValidationSchema } from "./sign-up";
import { AppAdvanceDropdown } from "@/shared/forms/AppAdvanceDropdown.component";
import { LOGIN } from "../../routes";

export const SignUpForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Formik
      initialValues={getSignUpInitialValues()}
      validationSchema={getSignUpValidationSchema()}
      onSubmit={(values, { setSubmitting }) => {
        setLoading(true);

        userSignUp({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          roleId: Number(values.roleId),
        }).subscribe({
          next: (response: SignUpResponse) => {
            navigate(LOGIN);
          },
          error: (err) => {
            errorHandler(err);
            setLoading(false);
          },
          complete: () => {
            setLoading(false);
          },
        });
      }}
    >
      <Form className="w-full max-w-md mx-auto p-6">
        <div className="mb-6">
          <AppInput
            name="firstName"
            label="First Name"
            placeholder="Enter your First Name"
          />
        </div>

        <div className="mb-6">
          <AppInput
            name="lastName"
            label="Last Name"
            placeholder="Enter your Last Name"
          />
        </div>

        <div className="mb-6">
          <AppInput
            name="email"
            label="Email"
            placeholder="Enter your email"
            icon="email"
          />
        </div>

        <div className="mb-6">
          <AppAdvanceDropdown
            name="roleId"
            label="Your current Role"
            placeholder="Select role"
            options={[
              { value: "1", label: "1st Response" },
              { value: "2", label: "1st Line" },
            ]}
          />
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#ee754e] text-white hover:bg-orange-700 transition"
          >
            {loading ? "Submitting..." : "Create Account"}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
