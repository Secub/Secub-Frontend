import type { ButtonHTMLAttributes, ReactNode } from "react";
import { getButtonClassName, type ButtonVariant } from "./Button";

export type IconButtonVariant = ButtonVariant;
export type IconButtonSize = "sm" | "md";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-10 w-10 min-h-10 p-0 text-lg",
  md: "h-12 w-12 min-h-12 p-0 text-xl",
};

export function IconButton({
  label,
  icon,
  variant = "outline",
  size = "sm",
  className = "",
  title,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={getButtonClassName({
        variant,
        size,
        className: ["shrink-0", sizeStyles[size], className].join(" "),
      })}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default IconButton;
