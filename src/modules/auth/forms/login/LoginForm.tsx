import { useState } from "react";
import { Form, Formik, Field } from "formik";
import { useNavigate, Link } from "react-router";

import { useAppDispatch } from "@/hooks/store-hooks";
import { AUTH_RESPONSE } from "@/constants/storage";
import storage from "@/services/storage/local-storage";

import { setBearerToken } from "@/services/api/base-api";

import { getLoginInitialValues, getLoginValidationSchema } from "./login";

import { authActions } from "@/app/redux/authSlice";
import { Button } from "@/components/ui/button";

import { authenticateUser } from "@/services/api/user-api";
import type { AuthenticationResponse } from "@/models/auth";
import { errorHandler } from "@/services/other/error-handler";
import { HOME } from "@/app/routes/client";
import { AppInput } from "@/shared/forms/AppInput.component";

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Formik
      initialValues={getLoginInitialValues()}
      validationSchema={getLoginValidationSchema()}
      onSubmit={(values, { setSubmitting }) => {
        setLoading(true);

        authenticateUser({
          username: values.username,
          password: values.password,
        }).subscribe({
          next: (response: AuthenticationResponse) => {
            setBearerToken(response.token);
            storage.set(AUTH_RESPONSE, response);
            dispatch(authActions.authenticateUserSuccess(response));

            navigate(HOME);
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
            name="username"
            label="Email"
            placeholder="Enter your email"
            icon="email"
          />
        </div>

        <AppInput
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          icon="password"
        />

        <div className="flex justify-between items-center mt-5 mb-5 text-sm">
          <label className="flex items-center space-x-2">
            <Field name="rememberMe">
              {({ field }: { field: any }) => (
                <input
                  type="checkbox"
                  {...field}
                  className="accent-primary-blue"
                  checked={field.value}
                />
              )}
            </Field>
            <span className="text-gray-500">Remember me</span>
          </label>

          <Link
            to="/reset-password"
            className="text-primary-blue hover:text-blue-800"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#ee754e] text-white hover:bg-orange-700 transition"
          >
            {loading ? "Submitting..." : "Sign In"}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
