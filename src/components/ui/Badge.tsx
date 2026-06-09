import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-secondary-3)] text-[var(--color-secondary-4)]",
  info: "bg-[var(--color-info)] text-[var(--color-secondary-4)]",
  success: "bg-[var(--color-success)] text-[var(--color-secondary-4)]",
  warning: "bg-[var(--color-warning)] text-[var(--color-secondary-4)]",
  danger: "bg-[var(--color-error)] text-white",
  accent: "bg-[var(--color-primary)] text-white",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap transition-colors",
        variantStyles[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
