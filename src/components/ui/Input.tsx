import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  success,
  leftIcon,
  rightIcon,
  id,
  className = "",
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const stateClass = error
    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[color:rgba(235,87,87,0.18)]"
    : success
      ? "border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-[color:rgba(118,202,102,0.18)]"
      : "border-[var(--color-gray-6)] focus:border-[var(--color-secondary-1)] focus:ring-[color:rgba(14,101,217,0.16)]";

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-[var(--color-gray-2)]"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-4)]">
            {leftIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          aria-invalid={!!error}
          className={[
            "w-full rounded-xl border bg-white text-sm text-[var(--color-gray-1)] shadow-sm transition-all duration-200",
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-4)]">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
      ) : success ? (
        <p className="mt-1.5 text-sm text-[var(--color-success)]">{success}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-[var(--color-gray-4)]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;