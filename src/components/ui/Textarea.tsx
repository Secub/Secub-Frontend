import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  hideLabel?: boolean;
}

export function Textarea({
  label,
  helperText,
  error,
  success,
  hideLabel = false,
  id,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;
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
          htmlFor={textareaId}
          className={[
            "mb-1.5 block text-sm font-medium text-[var(--color-gray-2)]",
            hideLabel ? "sr-only" : "",
          ].join(" ")}
        >
          {label}
          {props.required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-label={accessibleNameFallback}
        className={[
          "w-full rounded-xl border bg-[var(--secub-surface)] px-4 py-3 text-sm text-[var(--secub-text)] shadow-sm transition-all duration-200",
          "placeholder:text-[var(--color-gray-5)]",
          "focus:outline-none focus:ring-4",
          "disabled:cursor-not-allowed disabled:bg-[var(--color-gray-7)] disabled:text-[var(--color-gray-4)]",
          stateClass,
          className,
        ].join(" ")}
        {...props}
      />

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

export default Textarea;
