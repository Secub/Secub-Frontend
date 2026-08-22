import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonVariant } from "./Button";

export type IconButtonVariant = ButtonVariant | "inverse" | "danger_hover";
export type IconButtonSize = "xs" | "sm" | "md";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  selected?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const sizeStyles: Record<IconButtonSize, string> = {
  xs: "h-8 w-8 min-h-8 min-w-8 text-lg",
  sm: "h-10 w-10 min-h-10 min-w-10 text-xl",
  md: "h-12 w-12 min-h-12 min-w-12 text-2xl",
};

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    "text-[var(--secub-secondary)] hover:text-[var(--color-secondary-1)] focus-visible:text-[var(--color-secondary-1)] active:text-[var(--color-secondary-1)]",
  primary_soft:
    "text-[var(--color-secondary-1)] hover:text-[var(--secub-secondary)] focus-visible:text-[var(--secub-secondary)] active:text-[var(--secub-secondary)]",
  accent:
    "text-[var(--secub-primary)] hover:text-[var(--color-success)] focus-visible:text-[var(--color-success)] active:text-[var(--color-success)]",
  outline:
    "text-[var(--color-gray-4)] hover:text-[var(--color-secondary-1)] focus-visible:text-[var(--color-secondary-1)] active:text-[var(--color-secondary-1)]",
  ghost:
    "text-[var(--color-gray-4)] hover:text-[var(--color-secondary-4)] focus-visible:text-[var(--color-secondary-1)] active:text-[var(--color-secondary-1)]",
  danger:
    "text-[var(--color-error)] hover:text-[var(--color-error)] focus-visible:text-[var(--color-error)] active:text-[var(--color-error)]",
  danger_hover:
    "text-[var(--color-gray-4)] hover:text-[var(--color-error)] focus-visible:text-[var(--color-error)] active:text-[var(--color-error)]",
  inverse:
    "text-white hover:text-[var(--color-secondary-2)] focus-visible:text-[var(--color-secondary-2)] active:text-[var(--color-secondary-2)]",
};

const selectedVariantStyles: Record<IconButtonVariant, string> = {
  primary: "text-[var(--color-secondary-1)]",
  primary_soft: "text-[var(--secub-secondary)]",
  accent: "text-[var(--color-success)]",
  outline: "text-[var(--color-secondary-1)]",
  ghost: "text-[var(--color-secondary-1)]",
  danger: "text-[var(--color-error)]",
  danger_hover: "text-[var(--color-error)]",
  inverse: "text-[var(--color-secondary-2)]",
};

export function IconButton({
  label,
  icon,
  activeIcon,
  selected = false,
  variant = "outline",
  size = "sm",
  className = "",
  title,
  type = "button",
  disabled = false,
  ...props
}: IconButtonProps) {
  const canSwapIcon = Boolean(activeIcon) && !disabled;

  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      data-selected={selected ? "true" : undefined}
      disabled={disabled}
      className={[
        "group inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 transition-colors duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[var(--color-gray-5)] disabled:hover:text-[var(--color-gray-5)] disabled:opacity-55",
        sizeStyles[size],
        variantStyles[variant],
        selected ? selectedVariantStyles[variant] : "",
        className,
      ].join(" ")}
      {...props}
    >
      {selected && activeIcon ? (
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center transition-transform duration-150 group-focus-visible:scale-110 group-active:scale-95"
        >
          {activeIcon}
        </span>
      ) : (
        <>
          <span
            aria-hidden="true"
            className={[
              "inline-flex items-center justify-center transition-transform duration-150 group-focus-visible:scale-110 group-active:scale-95",
              canSwapIcon
                ? "group-hover:hidden group-focus-visible:hidden group-active:hidden"
                : "",
            ].join(" ")}
          >
            {icon}
          </span>

          {canSwapIcon ? (
            <span
              aria-hidden="true"
              className="hidden items-center justify-center transition-transform duration-150 group-hover:inline-flex group-focus-visible:inline-flex group-focus-visible:scale-110 group-active:inline-flex group-active:scale-95"
            >
              {activeIcon}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

export default IconButton;
