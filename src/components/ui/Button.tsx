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
  "inline-flex items-center justify-center gap-2 rounded-2xl font-heading font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-secondary-1)] text-white border border-[var(--color-secondary-1)] hover:opacity-95 focus:ring-[var(--color-secondary-1)]",
  primary_soft:
    "bg-[var(--color-secondary-1)]/5 text-black border border-[var(--color-secondary-1)] hover:opacity-80 focus:ring-[var(--color-secondary-1)]",
  accent:
    "bg-[var(--color-primary)] text-white border border-[var(--color-primary)] hover:opacity-95 focus:ring-[var(--color-primary)]",
  outline:
    "bg-white text-[var(--color-secondary-4)] border border-[var(--color-gray-6)] hover:bg-[var(--color-surface-soft)] focus:ring-[var(--color-secondary-1)]",
  ghost:
    "bg-transparent text-[var(--color-secondary-4)] border border-transparent hover:bg-[var(--color-surface-soft)] focus:ring-[var(--color-secondary-1)]",
  danger:
    "bg-[var(--color-error)] text-white border border-[var(--color-error)] hover:opacity-95 focus:ring-[var(--color-error)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-5 py-3 text-sm",
  lg: "min-h-14 px-6 py-4 text-base",
};

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
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
}

export default Button;