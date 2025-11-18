import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiInfo,
} from "react-icons/fi";

import { useField, useFormikContext, ErrorMessage } from "formik";

type AppInputProps = {
  label?: string;
  name: string;
  type?: string;
  readOnly?: boolean;
  icon?: "email" | "password" | "phone";
  required?: boolean;
  numeric?: boolean;
  tooltip?: string;
  [key: string]: any;
};

export const AppInput = ({
  label = "",
  type = "text",
  icon,
  required = false,
  numeric = false,
  tooltip,
  ...props
}: AppInputProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const renderIcon = () => {
    if (icon === "email") return <FiMail className="w-4 h-4 text-gray-500" />;
    if (icon === "password")
      return <FiLock className="w-4 h-4 text-gray-500" />;
    if (icon === "phone") return <FiPhone className="w-4 h-4 text-gray-500" />;
    return null;
  };

  return (
    <div className="mb-3">
      {label && (
        <Label
          htmlFor={props.name}
          className="mb-1 text-xs xl:text-sm text-gray-800 block text-left flex items-center gap-0.5"
        >
          <span>{label}</span>
          {required && <span className="text-red-500 ml-0">*</span>}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-400 hover:text-gray-600 cursor-pointer ml-1">
                  <FiInfo className="w-4 h-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </Label>
      )}

      <div className="relative">
        <Input
          type={inputType}
          id={props.name}
          className="h-10 pr-10"
          {...field}
          {...props}
          onChange={(e) => {
            let value = e.target.value;

            if (numeric) {
              value = value.replace(/\D/g, "");
            }

            setFieldValue(field.name, value);
          }}
        />

        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-default">
          {isPassword ? (
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer"
            >
              {showPassword ? (
                <FiEyeOff className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </span>
          ) : (
            icon && renderIcon()
          )}
        </span>
      </div>

      {/* <pre>{JSON.stringify(errors, null, 2)}</pre>
      <pre>{JSON.stringify(touched, null, 2)}</pre> */}
      <ErrorMessage name={props.name}>
        {(errorMsg: string) => (
          <p className="text-xs xl:text-sm text-red-500 mt-1 text-left">
            {errorMsg}
          </p>
        )}
      </ErrorMessage>
    </div>
  );
};
