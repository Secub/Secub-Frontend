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
  hideLabel?: boolean;
}

export function Select({
  label,
  options,
  placeholder = "Selecciona una opción",
  error,
  helperText,
  hideLabel = false,
  id,
  className = "",
  value,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const accessibleNameFallback =
    !label && !props["aria-label"] && !props["aria-labelledby"]
      ? placeholder
      : undefined;
  const describedBy = [ariaDescribedBy, error || helperText ? messageId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const stateClass = error
    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[color:rgba(235,87,87,0.18)]"
    : "border-[var(--color-gray-6)] focus:border-[var(--color-secondary-1)] focus:ring-[color:rgba(14,101,217,0.16)]";

  return (
    <div className="w-full min-w-0">
      {label ? (
        <label
          htmlFor={selectId}
          className={[
            "mb-1.5 block text-sm font-medium text-[var(--color-gray-2)]",
            hideLabel ? "sr-only" : "",
          ].join(" ")}
        >
          {label}
          {props.required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <div className="relative min-w-0">
        <select
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-label={accessibleNameFallback}
          value={value}
          className={[
            "w-full min-w-0 appearance-none rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-[var(--color-gray-1)] shadow-sm transition-all duration-200",
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

        <GoChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-gray-4)]"
        />
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : helperText ? (
        <p id={messageId} className="mt-1.5 text-sm text-[var(--color-gray-4)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Select;
