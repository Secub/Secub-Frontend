import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger" | "primary_soft";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-heading font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus)] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--secub-secondary)] text-[var(--secub-secondary-text)] border border-[var(--secub-secondary)] hover:opacity-95 focus:ring-[color:var(--secub-secondary)]",
  primary_soft:
    "bg-[color:rgba(14,101,217,0.08)] text-[var(--secub-text)] border border-[var(--secub-secondary)] hover:opacity-90 focus:ring-[color:var(--secub-secondary)]",
  accent:
    "bg-[var(--secub-primary)] text-[var(--secub-primary-text)] border border-[var(--secub-primary)] hover:opacity-95 focus:ring-[color:var(--secub-primary)]",
  outline:
    "bg-[var(--secub-surface)] text-[var(--secub-text)] border border-[var(--secub-border)] hover:bg-[var(--secub-surface-soft)] focus:ring-[color:var(--secub-secondary)]",
  ghost:
    "bg-transparent text-[var(--secub-text)] border border-transparent hover:bg-[var(--secub-surface-soft)] focus:ring-[color:var(--secub-secondary)]",
  danger:
    "bg-[var(--color-error)] text-white border border-[var(--color-error)] hover:opacity-95 focus:ring-[color:var(--color-error)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-5 py-3 text-sm",
  lg: "min-h-14 px-6 py-4 text-base",
};

export function getButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {leftIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {rightIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}

export type { ButtonSize, ButtonVariant };
export default Button;
