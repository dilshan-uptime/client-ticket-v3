import { useField, useFormikContext } from "formik";
import Select from "react-select";

type OptionType = { label: string; value: string | number };

type AppSelectProps = {
  name: string;
  label?: string;
  options: OptionType[];
  placeholder?: string;
  required?: boolean;
  isSearchable?: boolean;
  maxMenuHeight?: number;
  disabled?: boolean;
};

export const AppAdvanceDropdown = ({
  name,
  label,
  options,
  placeholder = "Select",
  required = false,
  isSearchable = true,
  maxMenuHeight = 200,
  disabled = false,
}: AppSelectProps) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const selectedOption = options.find(
    (opt) => opt.value.toString() === field.value?.toString()
  );

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs xl:text-sm text-gray-800 mb-1 text-left">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select
        className="text-left"
        options={options}
        value={selectedOption || null}
        onChange={(opt) => setFieldValue(name, opt?.value ?? "")}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isDisabled={disabled}
        maxMenuHeight={maxMenuHeight}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: "#d1d5db",
            borderRadius: 6,
            minHeight: "36px",
            fontSize: "0.875rem",
          }),
          option: (base, { isSelected }) => ({
            ...base,
            backgroundColor: isSelected ? "#e0f2fe" : "white",
            color: "#111827",
            fontSize: "0.875rem",
            cursor: "pointer",
            ":hover": { backgroundColor: "#f1f5f9" },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
      />

      {meta.touched && meta.error && (
        <p className="text-xs xl:text-sm text-red-500 mt-1 text-left">
          {meta.error}
        </p>
      )}
    </div>
  );
};
