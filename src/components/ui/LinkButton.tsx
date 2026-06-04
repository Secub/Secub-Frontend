import type { AnchorHTMLAttributes, ReactNode } from "react";
import { getButtonClassName, type ButtonSize, type ButtonVariant } from "./Button";

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function LinkButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <a
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
    </a>
  );
}

export default LinkButton;
