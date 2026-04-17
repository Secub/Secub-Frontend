import React from "react";
import { GoChevronDown } from "react-icons/go";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export function Select({
  label,
  options,
  placeholder = "Selecciona una opción",
  error,
  helperText,
  id,
  className = "",
  value,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  const stateClass = error
    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[color:rgba(235,87,87,0.18)]"
    : "border-[var(--color-gray-6)] focus:border-[var(--color-secondary-1)] focus:ring-[color:rgba(14,101,217,0.16)]";

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-[var(--color-gray-2)]"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={!!error}
          value={value}
          className={[
            "w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-[var(--color-gray-1)] shadow-sm transition-all duration-200",
            "focus:outline-none focus:ring-4",
            "disabled:cursor-not-allowed disabled:bg-[var(--color-gray-7)] disabled:text-[var(--color-gray-4)]",
            stateClass,
            className,
          ].join(" ")}
          {...props}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <GoChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-gray-4)]" />
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-[var(--color-gray-4)]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;
