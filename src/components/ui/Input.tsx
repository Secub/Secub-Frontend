import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hideLabel?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  success,
  leftIcon,
  rightIcon,
  hideLabel = false,
  id,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const accessibleNameFallback =
    !label && !props["aria-label"] && !props["aria-labelledby"]
      ? props.placeholder
      : undefined;
  const describedBy = [ariaDescribedBy, error || success || helperText ? messageId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const stateClass = error
    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[color:rgba(235,87,87,0.18)]"
    : success
      ? "border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-[color:rgba(118,202,102,0.18)]"
      : "border-[var(--secub-border)] focus:border-[var(--secub-secondary)] focus:ring-[color:var(--secub-focus-soft)]";

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className={[
            "mb-1.5 block text-sm font-medium text-[var(--color-gray-2)]",
            hideLabel ? "sr-only" : "",
          ].join(" ")}
        >
          {label}
          {props.required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-4)]"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-label={accessibleNameFallback}
          className={[
            "w-full rounded-xl border bg-[var(--secub-surface)] text-sm text-[var(--secub-text)] shadow-sm transition-all duration-200",
            "placeholder:text-[var(--color-gray-5)]",
            "focus:outline-none focus:ring-4",
            "disabled:cursor-not-allowed disabled:bg-[var(--color-gray-7)] disabled:text-[var(--color-gray-4)]",
            leftIcon ? "pl-11 pr-4 py-3" : "px-4 py-3",
            rightIcon ? "pr-11" : "",
            stateClass,
            className,
          ].join(" ")}
          {...props}
        />

        {rightIcon ? (
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-4)]"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : success ? (
        <p id={messageId} className="mt-1.5 text-sm text-[var(--color-success)]">
          {success}
        </p>
      ) : helperText ? (
        <p id={messageId} className="mt-1.5 text-sm text-[var(--color-gray-4)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
